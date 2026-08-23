"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { SITE_MARK_SRC } from "@/lib/site";
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
  const markSize = size === "sm" ? "size-7.5" : "size-8.5";
  const wordSize = size === "sm" ? "text-base" : "text-[17px] sm:text-lg";

  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Image
        src={SITE_MARK_SRC}
        alt=""
        aria-hidden="true"
        width={68}
        height={68}
        priority
        className={cn("shrink-0 object-contain", markSize)}
      />
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
