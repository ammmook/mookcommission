import Image from "next/image";
import { cn } from "@/lib/cn";

interface ArtPlaceholderProps {
  label?: string;
  className?: string;
  /** Smaller hatch pitch, used for thumbnails. */
  dense?: boolean;
  dashed?: boolean;
  /** Turn off the cream hatch when the caller supplies its own background. */
  hatch?: boolean;
  /**
   * Real artwork to show instead of the hatch. The image is cropped to fill
   * whatever box `className` defines — the frontend decides the size, not the
   * file's own dimensions.
   */
  src?: string | null;
  /** Describes the artwork. Empty string keeps it decorative for screen readers. */
  alt?: string;
  /** Viewport hint so next/image picks a sensible source width. */
  sizes?: string;
  /** Set on above-the-fold artwork so it is not lazy-loaded. */
  priority?: boolean;
}

/**
 * Artwork slot: renders `src` when there is one, and the hatched placeholder
 * when there is not (a bucket that has not been filled in yet, or Supabase not
 * configured).
 *
 * With `src`, only `overflow-hidden` is added to the caller's classes —
 * `cn` is a plain join with no conflict resolution, so introducing sizing,
 * rounding or positioning utilities here could silently fight the caller's.
 */
export function ArtPlaceholder({
  label,
  className,
  dense,
  dashed = true,
  hatch = true,
  src,
  alt = "",
  sizes = "(max-width: 1024px) 100vw, 480px",
  priority,
}: ArtPlaceholderProps) {
  if (src) {
    return (
      <div className={cn("overflow-hidden", className)}>
        {/* width/height only seed the aspect ratio for srcset generation; the
            classes below are what actually size the image. */}
        <Image
          src={src}
          alt={alt}
          width={900}
          height={900}
          sizes={sizes}
          priority={priority}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        "grid place-items-center rounded-2xl text-center font-mono text-[10px] font-medium",
        hatch && (dense ? "art-hatch-sm" : "art-hatch"),
        hatch && "text-[#B0A493]",
        dashed
          ? "border-[1.5px] border-dashed border-line-dashed"
          : "border-[1.5px] border-line",
        className,
      )}
    >
      {label}
    </div>
  );
}
