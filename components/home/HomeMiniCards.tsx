import { cn } from "@/lib/cn";

interface MiniCard {
  icon: string;
  title: string;
  body: string;
  tone: "light" | "dark";
}

const CARDS: MiniCard[] = [
  {
    icon: "✦",
    title: "Thank you for trusting me",
    body: "ขอบคุณที่ไว้ใจและสนับสนุนงานวาดของเรา จะตั้งใจทำทุกชิ้นให้ออกมาดีที่สุด",
    tone: "light",
  },
  {
    icon: "♡",
    title: "Made with care",
    body: "ขอบคุณที่มาอุดหนุนและฝากผลงานไว้กับเรา จะตั้งใจวาดให้เต็มที่ที่สุดนะ",
    tone: "dark",
  },

];

/**
 * The two mood cards under the hero copy. They carry no data — they exist to
 * give the layout a warm bottom edge, which is why the copy is a sentiment
 * rather than a statistic.
 *
 * Icon sits beside the text in the roomier row layouts and above it once the
 * cards narrow into the desktop hero column.
 */
export function HomeMiniCards({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:gap-3.5", className)}>
      {CARDS.map((card) => (
        <article
          key={card.title}
          className={cn(
            "flex items-center gap-3.5 rounded-3xl p-4 transition-transform duration-200 hover:-translate-y-1 sm:p-4.5 lg:flex-col lg:items-start lg:gap-0 lg:px-5 lg:py-4.5",
            card.tone === "light"
              ? "border-[1.5px] border-line-strong bg-white shadow-[0_4px_14px_rgba(43,35,64,.05)] hover:shadow-[0_12px_24px_rgba(43,35,64,.1)]"
              : "bg-linear-150 from-ink to-ink-soft shadow-[0_6px_18px_rgba(43,35,64,.22)]",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "grid size-9.5 shrink-0 place-items-center rounded-xl text-base lg:mb-3",
              card.tone === "light"
                ? "bg-amber-bg"
                : "bg-white/12 text-white",
            )}
          >
            {card.icon}
          </span>
          <div className="min-w-0">
            <h2
              className={cn(
                "font-display text-[14.5px] font-semibold lg:text-[15px]",
                card.tone === "light" ? "text-ink" : "text-white",
              )}
            >
              {card.title}
            </h2>
            <p
              className={cn(
                "mt-0.5 text-xs leading-relaxed lg:text-[12.5px]",
                card.tone === "light" ? "text-body" : "text-nav-text",
              )}
            >
              {card.body}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
