import { cn } from "@/lib/cn";

interface ArtPlaceholderProps {
  label?: string;
  className?: string;
  /** Smaller hatch pitch, used for thumbnails. */
  dense?: boolean;
  dashed?: boolean;
  /** Turn off the cream hatch when the caller supplies its own background. */
  hatch?: boolean;
}

/**
 * Stands in for artwork that a real build would load through next/image.
 * Kept as a component so swapping in <Image> later is a one-file change.
 */
export function ArtPlaceholder({
  label,
  className,
  dense,
  dashed = true,
  hatch = true,
}: ArtPlaceholderProps) {
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
