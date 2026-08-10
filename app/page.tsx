import { PageContainer } from "@/components/layout/PageContainer";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { QueueSearchForm } from "@/components/queue/QueueSearchForm";
import { ArtPlaceholder } from "@/components/ui/ArtPlaceholder";
import { activeLot, lotLabel } from "@/data/lots";

const STEPS = [
  {
    icon: "🔍",
    iconBg: "bg-coral-tint",
    title: "ค้นหาคิว",
    description: "ใส่รหัสคิวที่ศิลปินให้ไว้ หรือชื่อของคุณ",
    short: "ใส่รหัสหรือชื่อ",
  },
  {
    icon: "📋",
    iconBg: "bg-violet-bg",
    title: "ดูคิวของคุณ",
    description: "เห็นเลขคิวและจำนวนคิวที่เหลือทันที",
    short: "เหลืออีกกี่คิว",
  },
  {
    icon: "🎨",
    iconBg: "bg-teal-bg",
    title: "ติดตามงาน",
    description: "ดูภาพร่าง สถานะชำระเงิน และใบเสนอราคา",
    short: "ภาพร่าง · การชำระเงิน",
  },
];

export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1 bg-cream bg-[radial-gradient(600px_320px_at_90%_-6%,#FFE9D6_0%,rgba(255,233,214,0)_65%)] lg:bg-[radial-gradient(900px_420px_at_78%_-8%,#FFE9D6_0%,rgba(255,233,214,0)_62%)]">
        <PageContainer className="py-8 sm:py-12 lg:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-13">
            <section>
              <p className="inline-flex items-center gap-2 rounded-full bg-coral-tint px-3 py-1.5 text-[11px] font-semibold text-coral-deep sm:text-[11.5px]">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-teal"
                />
                {lotLabel(activeLot)} กำลังเปิดรับ · {activeLot.filled}/
                {activeLot.capacity} คิว
              </p>

              <h1 className="mt-3.5 text-[clamp(1.85rem,7vw,2.875rem)] leading-[1.2] font-bold text-ink">
                เช็กคิว Commission
                <br className="hidden sm:inline" /> ของคุณได้ทันที
              </h1>

              <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-body sm:text-[15px]">
                ใส่รหัสคิวหรือชื่อของคุณ แล้วดูได้เลยว่างานถึงขั้นตอนไหน
                เหลืออีกกี่คิว และต้องชำระเงินหรือยัง
              </p>

              {/* Illustration sits between copy and form on phones, beside them on desktop. */}
              <ArtPlaceholder
                label="ILLUSTRATION"
                className="my-5 h-37.5 w-full rounded-3xl lg:hidden"
              />

              <QueueSearchForm className="mt-0 max-w-lg lg:mt-6.5" />
            </section>

            <aside aria-hidden="true" className="relative hidden h-80 lg:block">
              <ArtPlaceholder
                label="ILLUSTRATION · artist at desk"
                className="absolute inset-y-6 right-0 left-5 rounded-3xl"
              />
              <div className="absolute top-1.5 -left-1 rounded-2xl border-[1.5px] border-line bg-white px-4 py-2.5 shadow-[0_8px_20px_rgba(43,35,64,.1)] animate-float">
                <span className="block font-mono text-[9.5px] font-medium text-subtle">
                  QUEUE
                </span>
                <span className="font-display text-lg font-bold text-ink">
                  #05
                </span>
              </div>
              <div className="absolute right-2 bottom-0.5 flex items-center gap-2 rounded-2xl bg-ink px-4 py-2.5 shadow-[0_8px_20px_rgba(43,35,64,.18)] animate-float [animation-delay:0.8s]">
                <span className="size-2.5 rounded-full bg-teal" />
                <span className="font-display text-xs font-semibold text-white">
                  กำลังลงสี
                </span>
              </div>
            </aside>
          </div>

          <section id="how-it-works" className="mt-10 scroll-mt-24 sm:mt-14">
            <h2 className="mb-4 text-[17px] font-semibold text-ink">
              ใช้งานง่าย 3 ขั้นตอน{" "}
              <span className="font-sans text-xs font-normal text-subtle">
                / How it works
              </span>
            </h2>
            <ol className="grid gap-3 sm:grid-cols-3 sm:gap-4">
              {STEPS.map((step, index) => (
                <li
                  key={step.title}
                  className="flex items-center gap-3 rounded-card border-[1.5px] border-line bg-white p-4 sm:flex-col sm:items-start sm:p-5"
                >
                  <span
                    aria-hidden="true"
                    className={`grid size-9 shrink-0 place-items-center rounded-xl text-lg sm:size-9.5 ${step.iconBg}`}
                  >
                    {step.icon}
                  </span>
                  <span className="min-w-0">
                    <h3 className="text-[15px] font-semibold text-ink sm:mt-3">
                      {index + 1}. {step.title}
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-body sm:mt-1 sm:text-[12.5px]">
                      <span className="sm:hidden">{step.short}</span>
                      <span className="hidden sm:inline">
                        {step.description}
                      </span>
                    </p>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </PageContainer>
      </main>

      <SiteFooter />
    </>
  );
}
