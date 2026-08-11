/**
 * Ambient blobs and sparkles behind the homepage hero.
 *
 * Purely decorative: `aria-hidden` and `pointer-events-none` throughout, so it
 * never intercepts a tap meant for the search form sitting above it. The parent
 * owns `position: relative` and `overflow-hidden` — the shapes bleed past the
 * edges on purpose.
 */
export function DecorativeElements() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Warm glow, top-right. Scales down with the viewport so it never
          swallows the copy on a 320px screen. */}
      <span className="absolute -top-30 -right-28 size-[min(85vw,620px)] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(255,176,32,.34),rgba(255,176,32,0)_66%)] blur-[6px] animate-drift" />
      {/* Coral counterweight, bottom-left. */}
      <span className="absolute -bottom-40 -left-28 size-[min(80vw,560px)] rounded-full bg-[radial-gradient(circle,rgba(255,107,87,.2),rgba(255,107,87,0)_64%)] blur-[4px] animate-drift [animation-direction:reverse] [animation-duration:22s]" />
      {/* Violet haze under the middle of the grid — desktop only, where there
          is enough empty space between the two columns to justify it. */}
      <span className="absolute top-[38%] left-[46%] hidden size-80 rounded-full bg-[radial-gradient(circle,rgba(124,107,245,.14),rgba(124,107,245,0)_68%)] blur-[3px] lg:block" />
    </div>
  );
}

/** A single twinkling star. Sizes and colours come from the caller. */
export function Sparkle({
  className,
  glyph = "✦",
  delay,
}: {
  className?: string;
  glyph?: "✦" | "✧";
  delay?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={delay ? { animationDelay: delay } : undefined}
      className={`pointer-events-none inline-block leading-none animate-twinkle ${className ?? ""}`}
    >
      {glyph}
    </span>
  );
}

/**
 * The scattered stars around the artwork column (desktop/tablet) — on phones
 * the hero uses the inline `SparkleRow` below instead.
 */
export function ArtworkSparkles() {
  return (
    <>
      <Sparkle className="absolute top-[6%] right-[8%] text-[26px] text-amber" />
      <Sparkle
        glyph="✧"
        delay="0.6s"
        className="absolute top-[24%] right-0 text-base text-coral"
      />
      <Sparkle
        glyph="✧"
        delay="1.1s"
        className="absolute bottom-[12%] left-[4%] text-xl text-violet"
      />
      <Sparkle
        delay="0.3s"
        className="absolute right-[22%] bottom-[2%] text-sm text-amber"
      />
    </>
  );
}

/** Centred star trio that breaks up the stacked mobile layout. */
export function SparkleRow({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`flex items-center justify-center gap-6 ${className ?? ""}`}
    >
      <Sparkle glyph="✧" className="text-[15px] text-violet" />
      <Sparkle delay="0.4s" className="text-[22px] text-amber" />
      <Sparkle glyph="✧" delay="0.8s" className="text-sm text-coral" />
    </div>
  );
}
