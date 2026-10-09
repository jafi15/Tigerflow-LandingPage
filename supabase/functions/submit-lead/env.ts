// Resolves the Supabase Secret Key under the current API key convention.
// Edge Functions receive it via SUPABASE_SECRET_KEYS, a JSON object keyed by
// key name (projects can hold more than one active secret key for
// rotation); SUPABASE_SECRET_KEY (a plain string) is the local-development
// fallback. Takes an injectable getter so this is testable without Deno.env.
export function resolveSecretKey(getEnv: (name: string) => string | undefined): string {
  const pluralRaw = getEnv("SUPABASE_SECRET_KEYS");
  if (pluralRaw) {
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(pluralRaw);
    } catch {
      throw new Error("SUPABASE_SECRET_KEYS is set but is not valid JSON");
    }
    const key = parsed.default ?? Object.values(parsed)[0];
    if (key) return key;
  }

  const singular = getEnv("SUPABASE_SECRET_KEY");
  if (singular) return singular;

  throw new Error("No Supabase secret key found (checked SUPABASE_SECRET_KEYS and SUPABASE_SECRET_KEY)");
}

// Same JSON-dictionary-keyed-by-name convention as the Secret Key, applied
// to Publishable Keys — a project can have more than one valid publishable
// key at once (key rotation), so this returns the full set rather than a
// single value.
export function resolvePublishableKeys(getEnv: (name: string) => string | undefined): string[] {
  const pluralRaw = getEnv("SUPABASE_PUBLISHABLE_KEYS");
  if (pluralRaw) {
    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(pluralRaw);
    } catch {
      throw new Error("SUPABASE_PUBLISHABLE_KEYS is set but is not valid JSON");
    }
    const keys = Object.values(parsed).filter((value): value is string => typeof value === "string" && value.length > 0);
    if (keys.length > 0) return keys;
  }

  const singular = getEnv("SUPABASE_PUBLISHABLE_KEY");
  if (singular) return [singular];

  throw new Error("No Supabase publishable key found (checked SUPABASE_PUBLISHABLE_KEYS and SUPABASE_PUBLISHABLE_KEY)");
}
