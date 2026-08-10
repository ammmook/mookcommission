import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Runs before every admin request to keep the Supabase auth cookie fresh and to
 * bounce signed-out visitors to the login screen.
 *
 * This is an optimistic check only — it looks at the session, not at the
 * `admins` table. The authoritative check happens in `app/admin/layout.tsx`
 * (and ultimately in RLS), which is what actually protects the data.
 *
 * Next 16 renamed `middleware.ts` to `proxy.ts`; the export must be `proxy`.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Without credentials there is no session to refresh; let the page render and
  // show its own "ยังไม่ได้ตั้งค่า Supabase" state instead of failing here.
  if (!url || !anonKey) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do not remove: this call is what refreshes an expiring token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  if (!user && !isLogin) {
    const target = request.nextUrl.clone();
    target.pathname = "/admin/login";
    // Send them back where they were headed once they sign in.
    target.searchParams.set("next", pathname);
    return NextResponse.redirect(target);
  }

  if (user && isLogin) {
    const target = request.nextUrl.clone();
    target.pathname = "/admin";
    target.search = "";
    return NextResponse.redirect(target);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
