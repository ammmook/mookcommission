"use client";

import { cn } from "@/lib/cn";
import { siteMark } from "@/lib/site";
import { useSiteSettings } from "@/lib/store/site-settings";

interface LogoProps {
  /** "sm" for headers, "md" for the landing hero and login screens. */
  size?: "sm" | "md";
  /** Tone of the wordmark next to the mark. */
  tone?: "ink" | "light";
  /** Shows the contact handle beside the name — used in tight headers. */
  showLatin?: boolean;
  className?: string;
  /** Extra classes on the wordmark, e.g. to hide it in a narrow icon rail. */
  wordClassName?: string;
}

export function Logo({
  size = "sm",
  tone = "ink",
  showLatin = false,
  className,
  wordClassName,
}: LogoProps) {
  const { studioName, contactHandle } = useSiteSettings();
  const markSize = size === "sm" ? "size-7.5 text-sm" : "size-8.5 text-[15px]";
  const wordSize = size === "sm" ? "text-base" : "text-[17px] sm:text-lg";

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "grid shrink-0 place-items-center rounded-xl bg-linear-135 from-coral to-amber font-display font-bold text-white",
          markSize,
        )}
      >
        {siteMark(studioName)}
      </span>
      <span
        className={cn(
          "font-display font-bold whitespace-nowrap",
          wordSize,
          tone === "light" ? "text-white" : "text-ink",
          wordClassName,
        )}
      >
        {studioName}
        {showLatin && contactHandle ? (
          <span className="ml-1.5 font-mono text-[11px] font-medium text-subtle">
            {contactHandle}
          </span>
        ) : null}
      </span>
    </span>
  );
}
