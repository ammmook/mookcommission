/**
 * Supabase connection settings, read once so a missing `.env.local` fails with
 * a sentence a human can act on rather than "Invalid URL" from deep inside the
 * client library.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const SETUP_HINT =
  "ยังไม่ได้ตั้งค่า Supabase — คัดลอก .env.local.example เป็น .env.local " +
  "แล้วใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY";

/** True when both variables are present, so callers can degrade politely. */
export const isSupabaseConfigured = Boolean(url && anonKey);

export function supabaseEnv(): { url: string; anonKey: string } {
  if (!url || !anonKey) throw new Error(SETUP_HINT);
  return { url, anonKey };
}
