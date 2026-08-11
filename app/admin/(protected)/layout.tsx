import { redirect } from "next/navigation";
import { AdminDataProvider } from "@/lib/store/admin-store";
import { getAdmin } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SupabaseSetupNotice } from "@/components/admin/SupabaseSetupNotice";
import { ToastProvider } from "@/components/ui/Toast";

/**
 * Gate for every admin screen except the login page, which sits outside this
 * route group so it is reachable while signed out.
 *
 * `proxy.ts` already bounces requests with no session; this check is the one
 * that verifies the signed-in user is actually in `admins`. RLS enforces the
 * same thing at the data layer, so a bypass here leaks nothing — it would just
 * render an empty dashboard.
 */
export default async function ProtectedAdminLayout({
  children,
}: LayoutProps<"/admin">) {
  if (!isSupabaseConfigured) return <SupabaseSetupNotice />;

  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  return (
    // Toasts sit outside the data provider so every mutation the store runs can
    // announce itself.
    <ToastProvider>
      <AdminDataProvider adminName={admin.displayName}>
        {children}
      </AdminDataProvider>
    </ToastProvider>
  );
}
