"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { signOutAdmin } from "@/lib/supabase/auth";

/** Clears the Supabase session, then lets `proxy.ts` do the redirecting. */
export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await signOutAdmin();
        router.replace("/admin/login");
        router.refresh();
      }}
    >
      {pending ? "กำลังออกจากระบบ…" : "ออกจากระบบ"}
    </Button>
  );
}
