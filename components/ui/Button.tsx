import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "dark"
  | "outline"
  | "ghost"
  | "warning"
  | "danger"
  | "danger-solid";

export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-coral text-white border-transparent btn-press",
  dark: "bg-ink text-white border-transparent hover:bg-ink-soft",
  outline:
    "bg-white text-ink border-line-strong hover:border-ink hover:bg-cream",
  ghost: "bg-transparent text-body border-transparent hover:bg-cream",
  warning:
    "bg-amber-bg text-amber-text border-amber-border hover:bg-amber-bg/70",
  danger: "bg-coral-bg text-coral-text border-coral-border hover:bg-coral-bg/70",
  "danger-solid": "bg-coral-deep text-white border-transparent hover:bg-[#c23f27]",
};

const sizeClasses: Record<ButtonSize, string> = {
  // Every size keeps a >=40px touch target; md and lg clear 44/48px.
  sm: "min-h-10 px-3.5 py-2 text-xs sm:text-[13px] rounded-xl",
  md: "min-h-11 px-4 py-2.5 text-sm rounded-xl sm:px-5",
  lg: "min-h-12 px-5 py-3.5 text-[15px] rounded-2xl",
};

interface BaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

function classesFor({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: BaseProps): string {
  return cn(
    "inline-flex items-center justify-center gap-2 border-[1.5px] font-display font-semibold",
    "cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-55",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "w-full",
    className,
  );
}

type ButtonProps = BaseProps & ComponentPropsWithoutRef<"button">;

export function Button({
  variant,
  size,
  fullWidth,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={classesFor({ variant, size, fullWidth, className, children })}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = BaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, "className" | "children">;

/** Same visual language as Button, but navigates. */
export function LinkButton({
  variant,
  size,
  fullWidth,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      {...rest}
      className={classesFor({ variant, size, fullWidth, className, children })}
    >
      {children}
    </Link>
  );
}
