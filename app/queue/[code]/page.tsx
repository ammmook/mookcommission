import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { CommissionDetails } from "@/components/queue/CommissionDetails";
import { PaymentCard } from "@/components/queue/PaymentCard";
import { QueueHeader } from "@/components/queue/QueueHeader";
import { QueueHero } from "@/components/queue/QueueHero";
import { QueueStepper } from "@/components/queue/QueueStepper";
import { SketchGallery } from "@/components/queue/SketchGallery";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import {
  currentQueueNumber,
  customers,
  getCustomerByCode,
} from "@/data/customers";
import { getLot } from "@/data/lots";
import { getQuotation } from "@/data/quotations";
import { queueTag } from "@/lib/format";

export function generateStaticParams() {
  return customers.map((customer) => ({ code: customer.code }));
}

export async function generateMetadata({
  params,
}: PageProps<"/queue/[code]">): Promise<Metadata> {
  const { code } = await params;
  const customer = getCustomerByCode(code);
  if (!customer) return { title: "ไม่พบคิว" };
  return { title: `คิว ${queueTag(customer.queueNumber)} · ${customer.name}` };
}

export default async function QueuePage({ params }: PageProps<"/queue/[code]">) {
  const { code } = await params;
  const customer = getCustomerByCode(code);
  if (!customer) notFound();

  const lot = getLot(customer.lotId);
  if (!lot) notFound();

  const quotation = getQuotation(customer.quotationId);
  const showQuotation = quotation?.status === "issued";
  const isCancelled = customer.state === "cancelled";

  return (
    <>
      <QueueHeader title="คิวของคุณ" code={customer.code} />

      <main className="flex-1 bg-cream pb-6">
        <PageContainer className="py-4 sm:py-6 lg:py-8">
          <div className="grid items-start gap-4 lg:grid-cols-[1.35fr_0.8fr] lg:gap-6">
            <div className="flex min-w-0 flex-col gap-4 sm:gap-5">
              <QueueHero
                customer={customer}
                lot={lot}
                currentQueueNumber={currentQueueNumber}
              />

              {customer.state === "paused" && customer.pausedNote ? (
                <p className="flex items-start gap-2.5 rounded-2xl border-[1.5px] border-amber-border bg-amber-bg px-4 py-3 text-xs leading-relaxed text-amber-text">
                  <span aria-hidden="true">⏸</span>
                  {customer.pausedNote}
                </p>
              ) : null}

              {isCancelled ? (
                <LinkButton href="/" variant="outline" size="lg" fullWidth>
                  ติดต่อศิลปิน
                </LinkButton>
              ) : (
                <>
                  <Card>
                    <CardHeader title="ขั้นตอนงาน" hint="/ Process" />
                    <QueueStepper
                      current={customer.stage}
                      history={customer.stageHistory}
                    />
                  </Card>

                  <Card>
                    <CardHeader
                      title="ภาพร่าง"
                      hint="/ Sketch gallery"
                      action={
                        <span className="font-mono text-[11px] font-medium text-subtle">
                          {customer.sketches.length} IMAGES
                        </span>
                      }
                    />
                    {customer.sketches.length > 0 ? (
                      <SketchGallery sketches={customer.sketches} />
                    ) : (
                      <p className="rounded-2xl border-[1.5px] border-dashed border-line-dashed bg-surface-muted px-4 py-6 text-center text-[12.5px] text-body">
                        ยังไม่มีภาพร่าง · ศิลปินจะอัปโหลดเมื่อเริ่มงาน
                      </p>
                    )}
                  </Card>
                </>
              )}
            </div>

            <aside className="flex min-w-0 flex-col gap-3.5 lg:sticky lg:top-24">
              <Card>
                <CardHeader title="รายละเอียดงาน" />
                <CommissionDetails spec={customer.commission} />
              </Card>

              {!isCancelled ? <PaymentCard customer={customer} /> : null}

              {showQuotation ? (
                <LinkButton
                  href={`/queue/${customer.code}/quotation`}
                  variant="outline"
                  size="lg"
                  fullWidth
                  className="border-2 border-ink hover:bg-ink hover:text-white"
                >
                  📄 ดูใบเสนอราคา
                </LinkButton>
              ) : !isCancelled ? (
                // The mockup hides the button until a quotation exists; we show
                // why instead, so the absence isn't confusing.
                <p className="rounded-2xl border-[1.5px] border-line bg-surface-muted px-4 py-3 text-center text-[11.5px] leading-relaxed text-subtle">
                  ใบเสนอราคาจะออกให้หลังจากศิลปินร่างภาพเสร็จ
                </p>
              ) : null}

              <p className="text-center text-[11.5px] leading-relaxed text-subtle">
                อัปเดตล่าสุด {customer.updatedLabel} · หากมีคำถามทักหาศิลปินได้เลย
              </p>
            </aside>
          </div>
        </PageContainer>
      </main>
    </>
  );
}
