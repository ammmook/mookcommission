import { Suspense } from "react";
import { QueueSearchForm } from "@/components/queue/QueueSearchForm";
import {
  ActiveLotPill,
  ActiveLotPillSkeleton,
} from "@/components/queue/ActiveLotPill";
import {
  ArtworkSparkles,
  DecorativeElements,
  Sparkle,
  SparkleRow,
} from "./DecorativeElements";
import { HomeArtwork } from "./HomeArtwork";
import { HomeMiniCards } from "./HomeMiniCards";

/**
 * Homepage hero.
 *
 * One grid, three named areas, re-arranged per breakpoint rather than scaled:
 *
 *   phones   copy → artwork → cards   (single column)
 *   tablets  copy | artwork, cards full width underneath
 *   desktop  copy + cards | artwork spanning both rows
 *
 * `overflow-hidden` on the section is what lets the ambient blobs and the
 * tilted polaroid bleed past the edges without ever causing sideways scroll.
 */
export function HomeHero() {
  return (
    // `flex-1 + items-center` keeps the hero optically centred on tall screens
    // instead of leaving a band of empty cream above the footer.
    <section className="relative flex flex-1 items-center overflow-hidden">
      <DecorativeElements />

      {/* Same frame as the header and footer, so the hero lines up with the
          logo on every screen and stays centred past 1180px. */}
      <div className="relative mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16 xl:py-20">
        <div className="grid gap-9 [grid-template-areas:'copy'_'art'_'cards'] md:grid-cols-[1fr_0.82fr] md:items-center md:gap-x-8 md:gap-y-8 md:[grid-template-areas:'copy_art'_'cards_cards'] lg:grid-cols-[1fr_0.92fr] lg:gap-x-14 lg:gap-y-9 lg:[grid-template-areas:'copy_art'_'cards_art'] xl:gap-x-16">
          <div className="[grid-area:copy] md:self-center">
            {/* Streams in so the heading and search box render immediately. */}
            <Suspense fallback={<ActiveLotPillSkeleton />}>
              <ActiveLotPill />
            </Suspense>

            {/* Stepped rather than fluid: the column's share of the viewport
                changes at each breakpoint, so vw-based sizing overshoots. */}
            <h1 className="mt-3.5 text-[1.75rem] leading-[1.3] font-bold text-ink sm:text-[1.875rem] md:text-[2.125rem] md:leading-[1.26] lg:text-[2.625rem] xl:text-[3.375rem] xl:leading-[1.22]">
              ระบบค้นหาคิว{" "}
              <span className="whitespace-nowrap">
                <span className="text-coral">@ammmook</span>{" "}
                <Sparkle className="align-baseline text-[0.62em] text-amber" />
              </span>
            </h1>

            <p className="mt-3.5 max-w-[27rem] text-sm leading-relaxed text-body sm:text-[15px] lg:text-base">
              ระบบค้นหาคิว หากไม่สามารถค้นหาได้ กรุณาติดต่อผ่านทาง FB: Mook
            </p>

            <QueueSearchForm className="mt-6 max-w-lg" />
          </div>

          <div className="relative flex flex-col items-center [grid-area:art] lg:min-h-[440px] lg:justify-center">
            {/* Soft organic shapes tucked behind the frame — desktop-sized only
                where there is room for them beside the artwork. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-2 left-0 hidden size-33 rounded-[38%_62%_55%_45%/48%_42%_58%_52%] bg-linear-150 from-amber/50 to-coral/28 animate-float-slow md:block"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-0 bottom-8 hidden size-26 rounded-[56%_44%_38%_62%/52%_58%_42%_48%] bg-linear-150 from-violet/32 to-violet/12 animate-float-slow [animation-delay:1.2s] [animation-duration:11s] lg:block"
            />

            <HomeArtwork />

            <div className="hidden md:contents">
              <ArtworkSparkles />
            </div>

            {/* Phones get the stars in the flow instead, where the stacked
                layout needs a visual break before the cards. */}
            <SparkleRow className="mt-7 md:hidden" />
          </div>

          <HomeMiniCards className="[grid-area:cards] lg:max-w-lg" />
        </div>
      </div>
    </section>
  );
}
