"use client";

import { Skeleton } from "@/components/ui/Skeleton";
import { useAdminData } from "@/lib/store/admin-store";
import { Button } from "@/components/ui/Button";

/**
 * The two states every admin screen needs once data comes over the network:
 * a skeleton while the first load runs, and a retry panel if it failed.
 *
 * Both borrow the shapes already used elsewhere (Skeleton, the coral error
 * panel from the queue error screen) so nothing new enters the design.
 */
export function AdminScreenSkeleton() {
  return (
    <div role="status" aria-label="กำลังโหลดข้อมูล" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-7 w-45" />
        <Skeleton className="ml-auto h-11 w-32 rounded-xl" still />
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-21 rounded-card" />
        ))}
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-2.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-27 rounded-card" />
          ))}
        </div>
        <Skeleton className="h-45 rounded-card" still />
      </div>
      <span className="sr-only">กำลังโหลดข้อมูลจากฐานข้อมูล</span>
    </div>
  );
}

export function AdminLoadError({ message }: { message: string }) {
  const { refresh } = useAdminData();

  return (
    <section
      role="alert"
      className="mx-auto max-w-md rounded-3xl border-[1.5px] border-coral-border bg-coral-bg px-5 py-6 text-center sm:px-6"
    >
      <span
        aria-hidden="true"
        className="mx-auto mb-3.5 grid size-13 place-items-center rounded-2xl bg-[#FFD8CF] text-[22px]"
      >
        📡
      </span>
      <h1 className="text-lg font-bold text-coral-text sm:text-xl">
        โหลดข้อมูลไม่สำเร็จ
      </h1>
      <p className="mt-2 text-[12.5px] leading-relaxed text-[#A5604D]">{message}</p>
      <Button
        onClick={() => void refresh()}
        variant="danger-solid"
        size="lg"
        fullWidth
        className="mt-4.5"
      >
        ลองอีกครั้ง / Try again
      </Button>
    </section>
  );
}

/**
 * Inline error strip for a failed mutation. Matches the coral wording used by
 * the forms, and is dismissed by the caller clearing its state.
 */
export function AdminActionError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-3 rounded-2xl border-[1.5px] border-coral-border bg-coral-bg px-4 py-3 text-[11.5px] leading-relaxed font-medium text-coral-text"
    >
      {message}
    </p>
  );
}
