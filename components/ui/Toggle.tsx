"use client";

import { cn } from "@/lib/cn";

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  className?: string;
}

/** Switch used for the payment status control. */
export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-7.5 w-13 shrink-0 cursor-pointer rounded-full transition-colors",
        checked ? "bg-teal" : "bg-line-strong",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-[3px] size-6 rounded-full bg-white shadow-sm transition-[left]",
          checked ? "left-[25px]" : "left-[3px]",
        )}
      />
    </button>
  );
}
