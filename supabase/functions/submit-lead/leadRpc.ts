// Deno- and Node-compatible wrapper around the single atomic RPC call that
// creates a lead and its project-check submission together. Making the
// write path exactly one call means there is no client-side code path that
// could ever observe or cause a partial write — atomicity itself is
// enforced inside the create_project_check_lead Postgres function.
import type { InsertLead, InsertLeadInput } from "./handler.ts";

interface RpcResult {
  data: unknown;
  error: { message: string } | null;
}

export interface LeadRpcClient {
  rpc(fn: string, args: Record<string, unknown>): Promise<RpcResult>;
}

export function createInsertLead(client: LeadRpcClient): InsertLead {
  return async (input: InsertLeadInput) => {
    const { error } = await client.rpc("create_project_check_lead", {
      p_request_id: input.request_id,
      p_path: input.path,
      p_locale: input.locale,
      p_improvement_focus: input.submission.improvement_focus,
      p_current_setup: input.submission.current_setup,
      p_primary_goal: input.submission.primary_goal,
      p_start_timeframe: input.submission.start_timeframe,
      p_recommendation_key: input.submission.recommendation_key,
      p_email: input.email,
      p_contact_name: input.contact_name,
      p_company: input.company,
      p_message: input.submission.message,
    });

    if (error) {
      throw new Error(error.message);
    }
  };
}
