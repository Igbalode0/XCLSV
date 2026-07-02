import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client for TRUSTED server-side writes only (e.g. a user
 * uploading their own avatar after we've authenticated them). It bypasses RLS,
 * so it must never be handed a path or action derived from unverified input.
 *
 * This is NOT the fan-facing read path — private content reads still go through
 * the RLS-enforced `createSupabaseServerClient` carrying the Clerk JWT.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY (server-only env, never NEXT_PUBLIC_*).
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase admin client is not configured.");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
