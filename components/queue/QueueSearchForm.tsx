"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { findCustomer } from "@/data/customers";
import { cn } from "@/lib/cn";

/**
 * Landing-page lookup. Resolves the code or name against mock data and routes
 * to the queue page; unknown values land on the "ไม่พบคิว" screen.
 */
export function QueueSearchForm({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("กรุณาใส่รหัสคิวหรือชื่อของคุณ");
      return;
    }
    setError(null);
    const match = findCustomer(trimmed);
    router.push(`/queue/${encodeURIComponent(match?.code ?? trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor="queue-code" className="sr-only">
          รหัสคิวหรือชื่อของคุณ
        </label>
        <input
          id="queue-code"
          type="text"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (error) setError(null);
          }}
          placeholder="เช่น MK001 หรือ ชื่อของคุณ"
          aria-describedby={error ? "queue-code-error" : undefined}
          aria-invalid={error ? true : undefined}
          className="min-w-0 flex-1 rounded-2xl border-2 border-line-strong bg-white px-4 py-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-subtle focus:border-violet"
        />
        <Button type="submit" size="lg" className="shrink-0 sm:px-6">
          <Search size={17} aria-hidden="true" />
          ค้นหาคิว
        </Button>
      </div>

      {error ? (
        <p
          id="queue-code-error"
          role="alert"
          className="mt-2 text-xs font-medium text-coral-text"
        >
          {error}
        </p>
      ) : (
        <p className="mt-3 text-xs text-subtle">
          ไม่ต้องสมัครสมาชิก · ค้นหาได้ทุกเวลา
        </p>
      )}
    </form>
  );
}
