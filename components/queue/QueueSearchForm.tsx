"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { supabaseBrowser } from "@/lib/supabase/client";
import { reportError } from "@/lib/supabase/errors";
import { findQueue } from "@/lib/supabase/public";

/**
 * Landing-page lookup, backed by the `find_queue()` RPC.
 *
 * The RPC matches a queue code or an exact customer name, and only within the
 * open lot — `queue_entries` itself is revoked from `anon`, so there is no way
 * (and no need) to query it here. A miss lands on the "ไม่พบคิว" screen.
 */
export function QueueSearchForm({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("กรุณาใส่รหัสคิวหรือชื่อของคุณ");
      return;
    }

    setError(null);
    setPending(true);

    try {
      const matches = await findQueue(supabaseBrowser(), trimmed);
      // No match still navigates: the queue page owns the "ไม่พบคิว" copy, and
      // sending the raw input there keeps a mistyped code visible in the URL.
      router.push(
        `/queue/${encodeURIComponent(matches[0]?.code ?? trimmed)}`,
      );
    } catch (searchError) {
      setError(reportError(searchError, "ค้นหาไม่สำเร็จ ลองใหม่อีกครั้ง"));
      setPending(false);
    }
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
        <Button
          type="submit"
          size="lg"
          className="shrink-0 sm:px-6"
          disabled={pending}
        >
          <Search size={17} aria-hidden="true" />
          {pending ? "กำลังค้นหา…" : "ค้นหาคิว"}
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
