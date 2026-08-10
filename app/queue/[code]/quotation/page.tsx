import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { QuotationDocument } from "@/components/quotation/QuotationDocument";
import { QueueHeader } from "@/components/queue/QueueHeader";
import { PrintActions } from "@/components/quotation/PrintActions";
import { ArtPlaceholder } from "@/components/ui/ArtPlaceholder";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getQueueDetail, type QueueDetail } from "@/lib/supabase/public";
import { supabasePublic } from "@/lib/supabase/server";

async function load(code: string): Promise<QueueDetail | null> {
  const db = await supabasePublic();
  return getQueueDetail(db, code);
}

export async function generateMetadata({
  params,
}: PageProps<"/queue/[code]/quotation">): Promise<Metadata> {
  const { code } = await params;
  const detail = await load(code);
  return {
    title: detail ? `ใบเสนอราคา · ${detail.customer.name}` : "ใบเสนอราคา",
  };
}

export default async function CustomerQuotationPage({
  params,
}: PageProps<"/queue/[code]/quotation">) {
  const { code } = await params;
  const detail = await load(code);
  if (!detail) notFound();

  const { customer, lot } = detail;
  // Drafts are internal: `get_queue_detail()` filters on status = 'issued', so
  // anything that reaches here is already safe to show.
  const issued = detail.quotation;

  return (
    <>
      <QueueHeader
        title="ใบเสนอราคา"
        code={customer.code}
        backHref={`/queue/${customer.code}`}
        backLabel="← กลับหน้าคิว"
      />

      {issued ? <PrintActions /> : null}

      <main className="flex-1 bg-canvas">
        <PageContainer width="narrow" className="py-5 sm:py-8">
          {issued ? (
            <QuotationDocument
              quotation={issued}
              customer={customer}
              lot={lot}
            />
          ) : (
            <div className="mx-auto flex max-w-md flex-col gap-3.5">
              <EmptyState
                visual={
                  <ArtPlaceholder
                    label="NO DOCUMENT"
                    className="h-32 w-27 rounded-xl"
                  />
                }
                title="ยังไม่มีใบเสนอราคา"
                description="ใบเสนอราคาจะถูกออกหลังจากศิลปินร่างภาพเสร็จ ระบบจะแจ้งให้ทราบอีกครั้ง"
                action={
                  <LinkButton
                    href={`/queue/${customer.code}`}
                    variant="outline"
                    size="lg"
                    fullWidth
                    className="border-2 border-ink"
                  >
                    กลับไปดูคิว
                  </LinkButton>
                }
              />
              <p className="rounded-2xl border-[1.5px] border-amber-border bg-amber-bg px-4 py-3 text-[11.5px] leading-relaxed text-amber-text">
                ปุ่ม “ดูใบเสนอราคา” ในหน้าคิวจะถูกซ่อนจนกว่าจะออกใบ
              </p>
            </div>
          )}
        </PageContainer>
      </main>
    </>
  );
}
