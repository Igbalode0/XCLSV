import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase server client whose requests carry the Clerk-issued JWT.
 *
 * This is the bridge that closes the Clerk↔Supabase seam: with the token
 * attached, RLS policies can reference auth.uid(), so the database itself
 * decides who may read private audio and fan-scoped rows. Prisma (direct
 * connection) handles migrations + trusted writes; anything fan-facing that
 * touches private content should go through THIS client.
 *
 * Requires a Clerk JWT template named "supabase".
 */
export async function createSupabaseServerClient() {
  const { getToken } = await auth();
  const token = await getToken({ template: "supabase" });
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
      cookies: {
        getAll: () => cookieStore.getAll(),
        // Read-only usage from server components; no cookie writes needed here.
        setAll: () => {},
      },
    },
  );
}
