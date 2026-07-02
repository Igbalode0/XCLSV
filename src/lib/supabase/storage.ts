import "server-only";
import { createSupabaseServerClient } from "./server";

const PRIVATE_AUDIO_BUCKET = process.env.SUPABASE_AUDIO_BUCKET ?? "private-audio";

// Deliberately short. A fan gets a fresh URL each time they press play; an
// intercepted link is useless within minutes. This is the heart of "private."
const SIGNED_URL_TTL_SECONDS = 60 * 5;

/**
 * Mint a short-lived signed URL for a private audio file.
 *
 * IMPORTANT: only call this AFTER verifying the requesting fan has access via
 * SongAccess / GroupMembership. RLS on storage.objects is the second line of
 * defense, not the first — authorize in the route handler, then mint here.
 */
export async function getSignedAudioUrl(path: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(PRIVATE_AUDIO_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    throw new Error("Could not authorize audio playback.");
  }
  return data.signedUrl;
}
