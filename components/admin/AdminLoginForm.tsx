"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

/**
 * Mock sign-in. There is no auth yet — any submission goes to the dashboard.
 * Replace `handleSubmit` with the real call when Supabase lands.
 */
export function AdminLoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    router.push("/admin");
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
            defaultValue="artist@torqueue.art"
            required
          />
        </Field>

        <Field label="รหัสผ่าน / Password" htmlFor="admin-password">
          <Input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            defaultValue="torqueue"
            required
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

        <Button type="submit" size="lg" fullWidth disabled={pending}>
          {pending ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </Button>
      </div>
    </form>
  );
}
