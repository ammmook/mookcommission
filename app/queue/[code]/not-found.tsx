import { PageContainer } from "@/components/layout/PageContainer";
import { QueueHeader } from "@/components/queue/QueueHeader";
import { ArtPlaceholder } from "@/components/ui/ArtPlaceholder";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function QueueNotFound() {
  return (
    <>
      <QueueHeader title="ไม่พบคิว" />
      <main className="flex-1 bg-cream">
        <PageContainer width="narrow" className="py-6 sm:py-10">
          <div className="mx-auto flex max-w-md flex-col gap-3.5">
            <EmptyState
              visual={
                <ArtPlaceholder
                  label="EMPTY ART"
                  className="size-24 rounded-full"
                />
              }
              title="ไม่พบคิวนี้"
              description="ไม่พบข้อมูลคิว หรือคิวนี้อยู่ใน Lot ที่ปิดไปแล้ว ลองตรวจสอบรหัสอีกครั้ง"
              action={
                <LinkButton href="/" size="lg" fullWidth>
                  ค้นหาอีกครั้ง
                </LinkButton>
              }
            />
            <p className="rounded-2xl border-[1.5px] border-line bg-cream px-4 py-3 text-[11.5px] leading-relaxed text-subtle">
              รหัสคิวคือตัวอักษร 2 ตัว + ตัวเลข 3 หลัก เช่น{" "}
              <code className="font-mono text-[11px] font-semibold text-ink">
                MK001
              </code>
            </p>
          </div>
        </PageContainer>
      </main>
    </>
  );
}
