"use client";

import { useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";

/**
 * Network / unexpected failure screen (mockup 1c). In Next 16 the recovery prop
 * is `retry`, not `reset`.
 */
export default function QueueError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center bg-cream">
      <PageContainer width="narrow" className="py-8 sm:py-12">
        <div className="mx-auto flex max-w-md flex-col gap-3.5">
          <section className="rounded-3xl border-[1.5px] border-coral-border bg-coral-bg px-5 py-6 text-center sm:px-6">
            <span
              aria-hidden="true"
              className="mx-auto mb-3.5 grid size-13 place-items-center rounded-2xl bg-[#FFD8CF] text-[22px]"
            >
              📡
            </span>
            <h1 className="text-lg font-bold text-coral-text sm:text-xl">
              ไม่สามารถโหลดข้อมูลได้
            </h1>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[#A5604D]">
              ตอนนี้เชื่อมต่อไม่ได้ ลองใหม่อีกครั้งในอีกสักครู่
            </p>
            <Button
              onClick={retry}
              variant="danger-solid"
              size="lg"
              fullWidth
              className="mt-4.5"
            >
              ลองอีกครั้ง / Try again
            </Button>
          </section>

          <p className="flex items-center gap-2.5 rounded-2xl bg-[#F7F3EC] px-4 py-3 text-[11.5px] text-subtle">
            <span aria-hidden="true" className="size-2 rounded-full bg-faint" />
            ไม่มีสิทธิ์เข้าถึง → พาไปหน้าเข้าสู่ระบบผู้ดูแล
          </p>
        </div>
      </PageContainer>
    </main>
  );
}
