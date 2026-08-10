import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

/**
 * Header for the customer queue screens: a full logo bar on desktop, a compact
 * back bar on phones (mockup 1b).
 */
export function QueueHeader({
  title,
  code,
  backHref = "/",
  backLabel = "← ค้นหาคิวอื่น",
}: {
  title: string;
  code?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b-[1.5px] border-line bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1180px] items-center gap-3 px-4 py-2.5 sm:px-6 sm:py-3.5 lg:px-10">
        <Link
          href={backHref}
          aria-label={backLabel}
          className="grid size-10 shrink-0 place-items-center rounded-xl border-[1.5px] border-line-strong bg-white text-ink sm:hidden"
        >
          <ArrowLeft size={16} aria-hidden="true" />
        </Link>

        <Link href="/" className="hidden shrink-0 sm:block">
          <Logo />
        </Link>

        <span className="min-w-0 flex-1 truncate font-display text-[15px] font-semibold text-ink sm:hidden">
          {title}
        </span>

        {code ? (
          <span className="shrink-0 font-mono text-[11px] font-medium text-subtle sm:hidden">
            {code}
          </span>
        ) : null}

        <Link
          href={backHref}
          className="ml-auto hidden shrink-0 rounded-full border-[1.5px] border-line-strong px-4 py-2 text-[13px] font-medium text-body transition-colors hover:border-ink hover:text-ink sm:block"
        >
          {backLabel}
        </Link>
      </div>
    </header>
  );
}
