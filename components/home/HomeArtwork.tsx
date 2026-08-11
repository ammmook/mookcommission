import { ArtPlaceholder } from "@/components/ui/ArtPlaceholder";
import { HERO_ILLUSTRATION } from "@/lib/illustrations";
import { cn } from "@/lib/cn";

/**
 * The tilted polaroid from the mockup: the hero illustration in a white frame,
 * with a paper card peeking out behind it, washi tape, a floating palette
 * sticker and a hand-written thank-you note.
 *
 * The artwork itself is `HERO_ILLUSTRATION` — the same image the page used
 * before — falling back to the hatched placeholder when Supabase is not
 * configured. Everything is sized in relative units so the frame shrinks with
 * its column instead of forcing a minimum width.
 */
export function HomeArtwork({ className }: { className?: string }) {
  return (
    <div
      // The tilt lives in a custom property so `animate-float-slow` can keep it
      // while translating — a plain rotate utility would be overwritten.
      style={{ "--r": "-2.2deg" } as React.CSSProperties}
      className={cn(
        "relative w-full max-w-[300px] -rotate-[2.2deg] animate-float-slow sm:max-w-[360px] lg:max-w-[430px]",
        className,
      )}
    >
      {/* Second sheet of paper behind the frame. */}
      <span
        aria-hidden="true"
        className="absolute inset-[14px_-10px_-14px_10px] rotate-[4.5deg] rounded-3xl border-[1.5px] border-line bg-white lg:inset-[18px_-14px_-18px_14px]"
      />

      <figure className="relative m-0 rounded-3xl border-[1.5px] border-line bg-white p-2.5 pb-3.5 shadow-[0_12px_30px_rgba(43,35,64,.13)] sm:p-3 lg:p-3.5 lg:pb-4.5 lg:shadow-[0_18px_42px_rgba(43,35,64,.16)]">
        {/* 16:9 rather than the mockup's 4:3 window: the illustration is a wide
            banner crop, and a 4:3 cover-crop would cut through the glasses. */}
        <div className="relative aspect-video overflow-hidden rounded-2xl">
          <ArtPlaceholder
            label="ARTWORK"
            src={HERO_ILLUSTRATION}
            alt="ผลงาน commission ล่าสุดของ @ammmook"
            priority
            sizes="(min-width: 1024px) 430px, (min-width: 640px) 45vw, 90vw"
            className="size-full rounded-2xl"
          />
          <span className="absolute right-2.5 bottom-2.5 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 font-display text-[11.5px] font-medium text-white shadow-[0_6px_16px_rgba(43,35,64,.3)] lg:gap-2 lg:px-3.5 lg:py-2.5 lg:text-[12.5px]">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-teal lg:size-2" />
            กำลังลงสี
          </span>
        </div>

        <figcaption className="flex items-center justify-between gap-2 px-1 pt-2.5 lg:px-1.5 lg:pt-3.5">
          <span className="font-display text-[13.5px] font-semibold text-ink lg:text-sm">
            ผลงานล่าสุด
          </span>
          <span className="font-mono text-[10px] font-medium whitespace-nowrap text-subtle lg:text-[11px]">
            LOOK INTO MY EYES · 2026
          </span>
        </figcaption>
      </figure>

      {/* Washi tape holding the frame down. */}
      <span
        aria-hidden="true"
        className="absolute -top-3 left-0 h-4 w-14 -rotate-12 rounded-sm bg-amber/50 sm:-left-3 lg:-top-4 lg:-left-6 lg:h-5 lg:w-16"
      />

      {/* Palette sticker. */}
      <span
        aria-hidden="true"
        className="absolute -top-4 right-3 flex gap-1.5 rounded-xl border-[1.5px] border-line bg-white px-2.5 py-2 shadow-[0_8px_18px_rgba(43,35,64,.12)] animate-float-slow [animation-delay:0.5s] [animation-duration:7s] lg:-top-5.5 lg:right-6.5 lg:rounded-2xl lg:px-3 lg:py-2.5"
      >
        <span className="size-3 rounded-full bg-coral lg:size-4" />
        <span className="size-3 rounded-full bg-amber lg:size-4" />
        <span className="size-3 rounded-full bg-violet lg:size-4" />
        <span className="hidden size-4 rounded-full bg-teal lg:block" />
      </span>

      {/* Thank-you note — desktop only, where the column has room below the frame. */}
      <span
        style={{ "--r": "-6deg" } as React.CSSProperties}
        aria-hidden="true"
        className="absolute -bottom-6.5 -left-7.5 hidden -rotate-6 rounded-2xl border-[1.5px] border-line bg-white px-3.5 py-2.5 text-[12.5px] text-body shadow-[0_10px_24px_rgba(43,35,64,.12)] animate-float-slow [animation-delay:0.9s] [animation-duration:10s] lg:block"
      >
        ขอบคุณที่อุดหนุน ♡
      </span>
    </div>
  );
}
