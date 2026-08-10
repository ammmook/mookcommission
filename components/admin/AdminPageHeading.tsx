import type { ReactNode } from "react";

interface AdminPageHeadingProps {
  title: ReactNode;
  subtitle?: string;
  /** Primary action; on phones it drops below the title and goes full width. */
  action?: ReactNode;
}

export function AdminPageHeading({
  title,
  subtitle,
  action,
}: AdminPageHeadingProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-ink sm:text-2xl">{title}</h1>
        {subtitle ? (
          <p className="mt-0.5 text-[12.5px] text-subtle">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 [&>*]:w-full sm:[&>*]:w-auto">{action}</div> : null}
    </div>
  );
}
