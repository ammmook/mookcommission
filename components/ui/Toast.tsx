"use client";

import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export type ToastVariant = "loading" | "success" | "error";

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

/** Handle for a save in flight — settle it once the write comes back. */
export interface PendingToast {
  success: (message?: string) => void;
  error: (message: string) => void;
  /** Drops the toast without a result, e.g. when a write was skipped. */
  dismiss: () => void;
}

interface ToastApi {
  show: (message: string, variant?: ToastVariant) => number;
  update: (id: number, message: string, variant: ToastVariant) => void;
  dismiss: (id: number) => void;
  /**
   * Shows "กำลังบันทึก…" and returns a handle that swaps it for the result.
   * The loading toast stays up until one of those is called.
   */
  saving: (message?: string) => PendingToast;
}

const ToastContext = createContext<ToastApi | null>(null);

/** How long a settled toast stays up. Errors linger so they can be read. */
const LINGER: Record<ToastVariant, number> = {
  loading: 0,
  success: 2400,
  error: 5200,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, number>());

  // Timers outlive the toast they belong to if the tree unmounts mid-save.
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((timer) => window.clearTimeout(timer));
      pending.clear();
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const scheduleDismiss = useCallback(
    (id: number, variant: ToastVariant) => {
      const linger = LINGER[variant];
      if (!linger) return;
      const existing = timers.current.get(id);
      if (existing) window.clearTimeout(existing);
      timers.current.set(
        id,
        window.setTimeout(() => {
          timers.current.delete(id);
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, linger),
      );
    },
    [],
  );

  const show = useCallback(
    (message: string, variant: ToastVariant = "loading") => {
      const id = nextId.current++;
      // Newest first, and never more than three on screen at once.
      setToasts((current) => [{ id, variant, message }, ...current].slice(0, 3));
      scheduleDismiss(id, variant);
      return id;
    },
    [scheduleDismiss],
  );

  const update = useCallback(
    (id: number, message: string, variant: ToastVariant) => {
      setToasts((current) =>
        current.map((toast) =>
          toast.id === id ? { ...toast, message, variant } : toast,
        ),
      );
      scheduleDismiss(id, variant);
    },
    [scheduleDismiss],
  );

  const saving = useCallback(
    (message = "กำลังบันทึก…"): PendingToast => {
      const id = show(message, "loading");
      return {
        success: (done = "บันทึกสำเร็จ") => update(id, done, "success"),
        error: (failure: string) => update(id, failure, "error"),
        dismiss: () => dismiss(id),
      };
    },
    [show, update, dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({ show, update, dismiss, saving }),
    [show, update, dismiss, saving],
  );

  return (
    <ToastContext value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used inside <ToastProvider>");
  return api;
}

const variantStyles: Record<ToastVariant, string> = {
  loading: "border-violet-border bg-white text-ink",
  success: "border-teal-border bg-teal-bg text-teal-text",
  error: "border-coral-border bg-coral-bg text-coral-text",
};

const iconStyles: Record<ToastVariant, string> = {
  loading: "bg-violet-bg text-violet-deep",
  success: "bg-white/70 text-teal-text",
  error: "bg-white/70 text-coral-text",
};

/**
 * Bottom-right stack. Phones get the full width minus a gutter so a long
 * message never pushes the layout sideways.
 */
function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-3 bottom-3 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5"
    >
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          onClick={() => onDismiss(toast.id)}
          className={cn(
            "pointer-events-auto flex w-full cursor-pointer items-center gap-2.5 rounded-2xl border-[1.5px] px-3.5 py-2.5 text-left text-[12.5px] font-medium shadow-[0_10px_28px_rgba(43,35,64,.16)] animate-scale-in sm:w-auto sm:max-w-xs",
            variantStyles[toast.variant],
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "grid size-6 shrink-0 place-items-center rounded-lg",
              iconStyles[toast.variant],
            )}
          >
            {toast.variant === "loading" ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : toast.variant === "success" ? (
              <Check size={13} />
            ) : (
              <CircleAlert size={13} />
            )}
          </span>
          {toast.message}
        </button>
      ))}
    </div>
  );
}
