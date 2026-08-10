"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Optional icon block above the title, e.g. the ⚠️ tile in the mockup. */
  icon?: ReactNode;
  children: ReactNode;
  /** Stacked action buttons rendered at the bottom. */
  footer?: ReactNode;
  className?: string;
}

/**
 * Centred dialog that stays inside the viewport on small screens: it never
 * exceeds `100% - 2rem` wide or 90vh tall, and its body scrolls independently.
 */
export function Modal({
  open,
  onClose,
  title,
  icon,
  children,
  footer,
  className,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    // Prevent the page behind the overlay from scrolling.
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 p-4 animate-fade-in sm:items-center"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className={cn(
          "flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-cream shadow-[0_22px_50px_rgba(43,35,64,.35)] animate-scale-in",
          className,
        )}
      >
        <div className="flex items-start gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
          <div className="min-w-0 flex-1">
            {icon}
            <h2
              id={titleId}
              className="text-lg font-bold text-ink sm:text-xl"
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl border-[1.5px] border-line-strong bg-white text-ink transition-colors hover:bg-cream"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
          {children}
        </div>

        {footer ? (
          <div className="flex flex-col gap-2.5 border-t-[1.5px] border-line px-5 py-4 sm:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
