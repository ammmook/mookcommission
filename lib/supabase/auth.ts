"use client";

/**
 * Browser-side admin authentication.
 *
 * Being in `auth.users` is not the same as being an admin: the `admins` table
 * decides that, and every RLS policy on this schema is written as
 * `using (is_admin())`. So a successful password check is followed by a lookup
 * of the caller's own `admins` row (which the `admin_self` policy allows), and
 * a signed-in non-admin is signed straight back out.
 *
 * There is deliberately no email or password comparison anywhere in this file.
 */

import { supabaseBrowser } from "./client";
import { reportError } from "./errors";

export interface AdminIdentity {
  id: string;
  displayName: string;
}

export type SignInResult =
  | { ok: true; admin: AdminIdentity }
  | { ok: false; message: string };

export async function signInAdmin(
  email: string,
  password: string,
): Promise<SignInResult> {
  const supabase = supabaseBrowser();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error || !data.user) {
    // Deliberately vague: never reveal whether the address exists.
    console.error("[torqueue] sign-in failed", error);
    return { ok: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
  }

  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("id, display_name")
    .eq("id", data.user.id)
    .maybeSingle();

  if (adminError) {
    await supabase.auth.signOut();
    return { ok: false, message: reportError(adminError, "เข้าสู่ระบบไม่สำเร็จ") };
  }

  if (!admin) {
    await supabase.auth.signOut();
    return {
      ok: false,
      message: "บัญชีนี้ยังไม่ได้รับสิทธิ์ผู้ดูแล — ติดต่อเจ้าของระบบ",
    };
  }

  return { ok: true, admin: { id: admin.id, displayName: admin.display_name } };
}

export async function signOutAdmin(): Promise<void> {
  await supabaseBrowser().auth.signOut();
}
