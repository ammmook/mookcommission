import { cn } from "@/lib/cn";

/** Shimmering block. Compose these to mirror the shape of the real content. */
export function Skeleton({
  className,
  still,
}: {
  className?: string;
  /** Static grey — used for secondary bits so the page doesn't strobe. */
  still?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block rounded-xl",
        still ? "bg-[#F0EAE2]" : "skeleton-shimmer",
        className,
      )}
    />
  );
}

/** The shared loading shape: hero, meta line, stepper, thumbnails. */
export function QueueSkeleton() {
  return (
    <div
      role="status"
      aria-label="กำลังโหลดข้อมูล"
      className="flex flex-col gap-3.5 rounded-card border-[1.5px] border-line bg-surface p-5"
    >
      <Skeleton className="h-24 rounded-2xl" />
      <div className="flex gap-2">
        <Skeleton className="h-3 flex-1" />
        <Skeleton className="h-3 w-15" still />
      </div>
      <div className="flex items-center gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="contents">
            {i > 0 ? <Skeleton className="h-[3px] flex-1 rounded-full" still /> : null}
            <Skeleton className="size-6.5 shrink-0 rounded-full" still />
          </span>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Skeleton className="aspect-3/4 rounded-xl" />
        <Skeleton className="aspect-3/4 rounded-xl" />
        <Skeleton className="hidden aspect-3/4 rounded-xl sm:block" />
        <Skeleton className="hidden aspect-3/4 rounded-xl sm:block" />
      </div>
      <span className="sr-only">กำลังโหลดข้อมูลคิว</span>
    </div>
  );
}
