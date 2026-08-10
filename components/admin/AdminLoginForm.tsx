"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { signInAdmin } from "@/lib/supabase/auth";

/**
 * Real sign-in against Supabase Auth. `signInAdmin` also confirms the account
 * has a row in `admins` — the only thing that grants access under RLS.
 */
export function AdminLoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setPending(true);
    setError(null);

    const result = await signInAdmin(email, password);

    if (!result.ok) {
      setError(result.message);
      setPending(false);
      return;
    }

    // `proxy.ts` puts the intended destination here when it bounced the request.
    const next = searchParams.get("next");
    router.replace(next?.startsWith("/admin") ? next : "/admin");
    // The session cookie was set client-side; refresh so the server layout sees it.
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col gap-3.5">
        <Field label="อีเมล / Email" htmlFor="admin-email">
          <Input
            id="admin-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={pending}
          />
        </Field>

        <Field label="รหัสผ่าน / Password" htmlFor="admin-password">
          <Input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            disabled={pending}
          />
        </Field>

        <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-[12.5px] text-body">
          <input
            type="checkbox"
            name="remember"
            defaultChecked
            className="size-4.5 accent-coral"
          />
          จดจำฉันไว้ในเครื่องนี้
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-2xl border-[1.5px] border-coral-border bg-coral-bg px-4 py-3 text-[12.5px] leading-relaxed font-medium text-coral-text"
          >
            {error}
          </p>
        ) : null}

        <Button type="submit" size="lg" fullWidth disabled={pending}>
          {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </Button>
      </div>
    </form>
  );
}
