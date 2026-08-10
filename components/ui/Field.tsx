import type {
  ComponentPropsWithoutRef,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/cn";

const controlClasses =
  "w-full min-w-0 rounded-xl border-2 border-line-strong bg-white px-3.5 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-subtle focus:border-violet sm:text-sm";

interface FieldProps {
  label: ReactNode;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
  /** Makes the field span the full width of a 2-column form grid. */
  full?: boolean;
}

/** Label + control stacked; the label is a real <label> tied to the control. */
export function Field({ label, htmlFor, children, className, full }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", full && "sm:col-span-2", className)}>
      <label
        htmlFor={htmlFor}
        className="text-[11.5px] font-medium text-body"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function Input({
  className,
  mono,
  ...rest
}: ComponentPropsWithoutRef<"input"> & { mono?: boolean }) {
  return (
    <input
      {...rest}
      className={cn(controlClasses, mono && "font-mono font-medium", className)}
    />
  );
}

export function Textarea({
  className,
  ...rest
}: ComponentPropsWithoutRef<"textarea">) {
  return (
    <textarea
      {...rest}
      className={cn(controlClasses, "resize-y leading-relaxed", className)}
    />
  );
}

export function Select({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...rest}
      className={cn(controlClasses, "cursor-pointer font-medium", className)}
    >
      {children}
    </select>
  );
}

/** Two-column on tablet and up, single column on phones. */
export function FormGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-3.5 sm:grid-cols-2", className)}>
      {children}
    </div>
  );
}
