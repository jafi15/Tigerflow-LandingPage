import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Static, lexical check of the Supabase SQL migrations. This does NOT spin up
// a database — there is no local Supabase CLI / Docker / Postgres available
// in this environment — so it cannot verify live RLS, EXECUTE-privilege or
// pg_cron scheduling behavior. It guards what is fully knowable from the SQL
// text alone: that the lead tables and the server-only RPC functions never
// grant anon/authenticated/public any privilege or policy, that the only
// explicit grants anywhere go to service_role, and that a time-driven
// cleanup job for rate_limit_counters actually exists.

const migrationsDir = fileURLToPath(new URL("../supabase/migrations/", import.meta.url));
const migrationFiles = readdirSync(migrationsDir).filter((file) => file.endsWith(".sql"));

const TABLE_MIGRATIONS = [
  "20261009120000_create_leads_table.sql",
  "20261009120100_create_project_check_submissions_table.sql",
  "20261009120300_create_rate_limit_counters.sql",
];
const FUNCTION_MIGRATIONS = [
  "20261009120200_create_project_check_lead_rpc.sql",
  "20261009120300_create_rate_limit_counters.sql",
];
// Migrations allowed to contain a GRANT statement at all — every other
// migration must rely solely on REVOKE (default-deny) for anon/
// authenticated/public.
const GRANT_MIGRATION = "20261009120400_grant_service_role_lead_pipeline_privileges.sql";
const CRON_MIGRATION = "20261009120500_schedule_rate_limit_counters_cleanup.sql";
const CONTACT_MIGRATION = "20261009130000_add_contact_request_and_idempotency.sql";
const SEARCH_PATH_HARDENING_MIGRATION = "20261009140000_harden_set_updated_at_search_path.sql";
const GRANT_ALLOWED_MIGRATIONS = [GRANT_MIGRATION, CONTACT_MIGRATION];

function readMigration(file) {
  return readFileSync(path.join(migrationsDir, file), "utf8");
}

describe("Supabase lead-table and RPC access model (static check)", () => {
  it("defines exactly the expected migrations", () => {
    expect([...migrationFiles].sort()).toEqual(
      [
        "20261009120000_create_leads_table.sql",
        "20261009120100_create_project_check_submissions_table.sql",
        "20261009120200_create_project_check_lead_rpc.sql",
        "20261009120300_create_rate_limit_counters.sql",
        GRANT_MIGRATION,
        CRON_MIGRATION,
        CONTACT_MIGRATION,
        SEARCH_PATH_HARDENING_MIGRATION,
      ].sort()
    );
  });

  it(`${SEARCH_PATH_HARDENING_MIGRATION} hardens set_updated_at() with an explicit search_path (Security Advisor fix)`, () => {
    const sql = readMigration(SEARCH_PATH_HARDENING_MIGRATION).toLowerCase();
    expect(sql).toMatch(/alter function public\.set_updated_at\(\) set search_path = ''/);
  });

  it.each(migrationFiles.filter((file) => !GRANT_ALLOWED_MIGRATIONS.includes(file)))(
    "%s never creates a policy or a GRANT for any role",
    (file) => {
      const sql = readMigration(file).toLowerCase();
      expect(sql).not.toMatch(/create policy/);
      expect(sql).not.toMatch(/\bgrant\b/);
    }
  );

  it.each(TABLE_MIGRATIONS)("%s enables RLS and revokes all table privileges from public/anon/authenticated", (file) => {
    const sql = readMigration(file).toLowerCase();
    expect(sql).toMatch(/enable row level security/);
    expect(sql).toMatch(/revoke all on (table )?public\.\w+ from public, anon, authenticated/);
  });

  it.each(FUNCTION_MIGRATIONS)("%s revokes EXECUTE on its RPC function from public/anon/authenticated", (file) => {
    const sql = readMigration(file).toLowerCase();
    expect(sql).toMatch(/revoke all on function[\s\S]*from public, anon, authenticated/);
  });

  describe(GRANT_MIGRATION, () => {
    const sql = readMigration(GRANT_MIGRATION).toLowerCase();

    it("grants only service_role, never public/anon/authenticated", () => {
      const grantLines = sql
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => !line.startsWith("--") && /^grant\b/.test(line));
      expect(grantLines.length).toBeGreaterThan(0);
      for (const line of grantLines) {
        expect(line).toMatch(/to service_role/);
      }
      expect(sql).not.toMatch(/\bto\s+(public|anon|authenticated)\b/);
      expect(sql).not.toMatch(/create policy/);
      expect(sql).not.toMatch(/\brevoke\b/); // this migration only adds grants; earlier REVOKEs stand on their own
    });

    it("grants exactly the table privileges create_project_check_lead needs", () => {
      expect(sql).toMatch(/grant insert on public\.leads to service_role/);
      expect(sql).toMatch(/grant select \(id\) on public\.leads to service_role/);
      expect(sql).toMatch(/grant insert on public\.project_check_submissions to service_role/);
    });

    it("grants exactly the table privileges check_rate_limit needs", () => {
      expect(sql).toMatch(/grant insert, update, delete on public\.rate_limit_counters to service_role/);
      expect(sql).toMatch(/grant select \([^)]*window_start[^)]*\) on public\.rate_limit_counters to service_role/);
      expect(sql).toMatch(/grant select \([^)]*request_count[^)]*\) on public\.rate_limit_counters to service_role/);
    });

    it("grants EXECUTE on both RPC functions to service_role", () => {
      expect(sql).toMatch(/grant execute on function public\.create_project_check_lead\([^)]*\) to service_role/);
      expect(sql).toMatch(/grant execute on function public\.check_rate_limit\([^)]*\) to service_role/);
    });
  });

  describe(CRON_MIGRATION, () => {
    const sql = readMigration(CRON_MIGRATION).toLowerCase();

    it("enables pg_cron and schedules a named, idempotently-reschedulable cleanup job", () => {
      expect(sql).toMatch(/create extension if not exists pg_cron/);
      expect(sql).toMatch(/cron\.unschedule/); // guards against duplicate jobs on re-run
      expect(sql).toMatch(/cron\.schedule/);
    });

    it("actually deletes expired rate_limit_counters rows on a short, traffic-independent interval", () => {
      expect(sql).toMatch(/delete from public\.rate_limit_counters where window_start < now\(\) - interval '30 minutes'/);
      // runs at least every 15 minutes, every hour, or more often — not e.g. daily/weekly
      expect(sql).toMatch(/\*\/(1[0-5]|[1-9])\s+\*\s+\*\s+\*\s+\*/);
    });

    it("never grants the cron schema to anon/authenticated/public", () => {
      expect(sql).not.toMatch(/\bto\s+(public|anon|authenticated)\b/);
    });
  });

  it("restricts leads.status, leads.source and leads.locale to fixed allow-lists", () => {
    const sql = readMigration("20261009120000_create_leads_table.sql");
    expect(sql).toMatch(/status in \('new', 'contacted', 'qualified', 'won', 'lost'\)/);
    expect(sql).toMatch(/source in \('project_check'\)/);
    expect(sql).toMatch(/locale in \('de'\)/);
  });

  it("restricts every project_check_submissions answer column to the ProjectCheck.jsx option set", () => {
    const sql = readMigration("20261009120100_create_project_check_submissions_table.sql");
    expect(sql).toMatch(/improvement_focus in \('webdesign', 'seo', 'inquiries', 'automation'\)/);
    expect(sql).toMatch(/current_setup in \('none', 'existing', 'tools', 'unclear'\)/);
    expect(sql).toMatch(/primary_goal in \('clarity', 'visibility', 'response', 'efficiency'\)/);
    expect(sql).toMatch(/start_timeframe in \('soon', 'one-to-three', 'three-plus', 'exploring'\)/);
    expect(sql).toMatch(/recommendation_key in \('webdesign', 'seo', 'inquiries', 'automation'\)/);
  });

  it("references leads(id) as a foreign key from project_check_submissions", () => {
    const sql = readMigration("20261009120100_create_project_check_submissions_table.sql").toLowerCase();
    expect(sql).toMatch(/lead_id uuid not null references public\.leads \(id\)/);
  });

  it("creates the lead+submission write path as a single plpgsql function with no exception handler that could mask a partial write", () => {
    const sql = readMigration("20261009120200_create_project_check_lead_rpc.sql").toLowerCase();
    expect(sql).toMatch(/create function public\.create_project_check_lead/);
    expect(sql).toMatch(/language plpgsql/);
    expect(sql).not.toMatch(/exception\s+when/);
    expect(sql).toMatch(/insert into public\.leads/);
    expect(sql).toMatch(/insert into public\.project_check_submissions/);
  });

  it("creates rate_limit_counters as a table separate from leads/project_check_submissions, keyed by a pseudonymous hash, with no lead linkage", () => {
    const sql = readMigration("20261009120300_create_rate_limit_counters.sql").toLowerCase();
    expect(sql).toMatch(/create table public\.rate_limit_counters/);
    expect(sql).toMatch(/client_hash text not null/);
    expect(sql).not.toMatch(/lead_id/);
    expect(sql).not.toMatch(/references public\.leads/);
  });

  describe(CONTACT_MIGRATION, () => {
    const sql = readMigration(CONTACT_MIGRATION);
    const lower = sql.toLowerCase();

    it("grants only service_role, never public/anon/authenticated, and still revokes EXECUTE for everyone else on the new function", () => {
      const grantLines = lower
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => !line.startsWith("--") && /^grant\b/.test(line));
      expect(grantLines.length).toBeGreaterThan(0);
      for (const line of grantLines) {
        expect(line).toMatch(/to service_role/);
      }
      expect(lower).not.toMatch(/\bto\s+(public|anon|authenticated)\b/);
      expect(lower).toMatch(/revoke all on function[\s\S]*create_project_check_lead[\s\S]*from public, anon, authenticated/);
    });

    it("drops the old 7-arg create_project_check_lead signature before creating the new one (no coexistence window)", () => {
      const dropIndex = lower.indexOf("drop function public.create_project_check_lead(text, text, text, text, text, text, text)");
      const createIndex = lower.indexOf("create function public.create_project_check_lead(");
      expect(dropIndex).toBeGreaterThanOrEqual(0);
      expect(createIndex).toBeGreaterThan(dropIndex);
    });

    it("makes leads.email required, trimmed/lowercased, and length-capped at 254", () => {
      expect(lower).toMatch(/alter table public\.leads alter column email set not null/);
      expect(lower).toMatch(/char_length\(email\) <= 254/);
      expect(lower).toMatch(/email = lower\(btrim\(email\)\)/);
    });

    it("adds contact_name (<=120) and company (<=200) as optional leads columns", () => {
      expect(lower).toMatch(/add column request_id uuid not null/);
      expect(lower).toMatch(/contact_name is null or char_length\(contact_name\) <= 120/);
      expect(lower).toMatch(/company is null or char_length\(company\) <= 200/);
    });

    it("gives leads.request_id a unique constraint (the idempotency key)", () => {
      expect(lower).toMatch(/add constraint leads_request_id_key unique \(request_id\)/);
    });

    it("adds project_check_submissions.message capped at 1000 characters", () => {
      expect(lower).toMatch(/project_check_submissions add column message text/);
      expect(lower).toMatch(/message is null or char_length\(message\) <= 1000/);
    });

    it("implements idempotency via ON CONFLICT (request_id) DO NOTHING and never UPDATEs an existing lead", () => {
      expect(lower).toMatch(/on conflict \(request_id\) do nothing/);
      expect(lower).not.toMatch(/update public\.leads/);
    });
  });

  it("never stores a full/raw client network address, a user agent, or a submission_meta table", () => {
    const allSql = migrationFiles.map(readMigration).join("\n").toLowerCase();
    expect(allSql).not.toMatch(/submission_meta/);
    expect(allSql).not.toMatch(/ip_address|ip_hash|\bip\b/);
    expect(allSql).not.toMatch(/user_agent/);
  });
});
