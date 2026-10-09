import { describe, expect, it, vi } from "vitest";
import { createInsertLead } from "./leadRpc.ts";

// True transactional rollback is enforced inside the create_project_check_lead
// Postgres function itself (a single plpgsql function body is atomic — if the
// second insert fails, the whole call, including the first insert, is rolled
// back). That cannot be exercised here without a running Postgres instance
// (no Supabase CLI / Docker available in this environment). What IS verified
// here, genuinely: our client code makes exactly one RPC call for the whole
// lead+submission creation, so there is no code path in this project where a
// partial write could ever be observed or caused from the caller's side —
// success and failure are the only two possible outcomes of that one call.

function fakeClient(rpcImpl) {
  return { rpc: vi.fn(rpcImpl) };
}

const REQUEST_ID = "123e4567-e89b-12d3-a456-426614174000";

const input = {
  request_id: REQUEST_ID,
  email: "visitor@example.com",
  contact_name: "Jane Doe",
  company: "Acme GmbH",
  path: "/",
  locale: "de",
  submission: {
    improvement_focus: "webdesign",
    current_setup: "existing",
    primary_goal: "clarity",
    start_timeframe: "one-to-three",
    recommendation_key: "webdesign",
    message: "Kurze Nachricht.",
  },
};

describe("createInsertLead", () => {
  it("performs exactly one atomic RPC call carrying the request_id, contact fields, lead and submission fields", async () => {
    const client = fakeClient(async () => ({ data: "11111111-1111-1111-1111-111111111111", error: null }));
    const insertLead = createInsertLead(client);

    await insertLead(input);

    expect(client.rpc).toHaveBeenCalledTimes(1);
    const [fn, args] = client.rpc.mock.calls[0];
    expect(fn).toBe("create_project_check_lead");
    expect(args).toEqual({
      p_request_id: REQUEST_ID,
      p_path: "/",
      p_locale: "de",
      p_improvement_focus: "webdesign",
      p_current_setup: "existing",
      p_primary_goal: "clarity",
      p_start_timeframe: "one-to-three",
      p_recommendation_key: "webdesign",
      p_email: "visitor@example.com",
      p_contact_name: "Jane Doe",
      p_company: "Acme GmbH",
      p_message: "Kurze Nachricht.",
    });
  });

  it("passes null through for omitted optional contact fields rather than undefined", async () => {
    const client = fakeClient(async () => ({ data: "11111111-1111-1111-1111-111111111111", error: null }));
    const insertLead = createInsertLead(client);

    await insertLead({
      ...input,
      contact_name: null,
      company: null,
      submission: { ...input.submission, message: null },
    });

    const [, args] = client.rpc.mock.calls[0];
    expect(args.p_contact_name).toBeNull();
    expect(args.p_company).toBeNull();
    expect(args.p_message).toBeNull();
  });

  it("surfaces an RPC-level failure (e.g. a constraint violation on either insert) as a single thrown error, never a partial success", async () => {
    const client = fakeClient(async () => ({
      data: null,
      error: { message: "new row for relation violates check constraint" },
    }));
    const insertLead = createInsertLead(client);

    await expect(insertLead(input)).rejects.toThrow();
    expect(client.rpc).toHaveBeenCalledTimes(1);
  });

  it("makes no second call and no fallback write attempt after a failure", async () => {
    const client = fakeClient(async () => ({ data: null, error: { message: "boom" } }));
    const insertLead = createInsertLead(client);

    await expect(insertLead(input)).rejects.toThrow();
    // No retry, no secondary insert attempt from the client — the only
    // write path is the single RPC call asserted above.
    expect(client.rpc).toHaveBeenCalledTimes(1);
  });
});
