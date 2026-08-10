import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { QueueSearchForm } from "@/components/queue/QueueSearchForm";
import {
  ActiveLotPill,
  ActiveLotPillSkeleton,
} from "@/components/queue/ActiveLotPill";
import { ArtPlaceholder } from "@/components/ui/ArtPlaceholder";
import { HERO_ILLUSTRATION } from "@/lib/illustrations";


export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main className="flex-1 bg-cream bg-[radial-gradient(600px_320px_at_90%_-6%,#FFE9D6_0%,rgba(255,233,214,0)_65%)] lg:bg-[radial-gradient(900px_420px_at_78%_-8%,#FFE9D6_0%,rgba(255,233,214,0)_62%)]">
        <PageContainer className="py-8 sm:py-12 lg:py-14">
          <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-13">
            <section>
              {/* Streams in so the hero and search box render immediately. */}
              <Suspense fallback={<ActiveLotPillSkeleton />}>
                <ActiveLotPill />
              </Suspense>

              <h1 className="mt-3.5 text-[clamp(1.85rem,7vw,2.875rem)] leading-[1.2] font-bold text-ink">
                ระบบค้นหาคิว @ammmook
              </h1>

              <p className="mt-2.5 max-w-md text-[13.5px] leading-relaxed text-body sm:text-[15px]">
                ใส่รหัสคิวที่ได้จากนักวาด
              </p>

              {/* Illustration sits between copy and form on phones, beside them on desktop. */}
              <ArtPlaceholder
                label="ILLUSTRATION"
                src={HERO_ILLUSTRATION}
                priority
                sizes="(min-width: 1024px) 1px, 100vw"
                className="my-5 h-37.5 w-full rounded-3xl lg:hidden"
              />

              <QueueSearchForm className="mt-0 max-w-lg lg:mt-6.5" />
            </section>

            <aside aria-hidden="true" className="relative hidden h-80 lg:block">
              <ArtPlaceholder
                label="ILLUSTRATION · artist at desk"
                src={HERO_ILLUSTRATION}
                priority
                sizes="(min-width: 1024px) 520px, 1px"
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
        </PageContainer>
      </main>

      <SiteFooter />
    </>
  );
}
