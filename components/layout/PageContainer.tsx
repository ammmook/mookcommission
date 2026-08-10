import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageContainerProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /**
   * Content ceiling. The mockup's widest layout is ~1050px of content inside a
   * 1180px frame, so "wide" stops there rather than stretching on large screens.
   */
  width?: "narrow" | "wide" | "full";
}

const widthClasses = {
  narrow: "max-w-3xl",
  wide: "max-w-[1060px]",
  full: "max-w-[1320px]",
} as const;

export function PageContainer({
  as: Tag = "div",
  children,
  className,
  width = "wide",
}: PageContainerProps) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        widthClasses[width],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
