"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LogOut, Menu, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";
import { ADMIN_NAV, isNavItemActive } from "./adminNav";

interface AdminShellProps {
  children: ReactNode;
  /** Title shown in the compact header below `md`. */
  mobileTitle: string;
  /** Back link for drill-down screens; replaces the hamburger. */
  mobileBack?: { href: string; label: string };
  /** Small mono text at the right of the compact header, e.g. a queue code. */
  mobileMeta?: string;
  /** Drill-down screens hide the tab bar and supply their own action bar. */
  showTabBar?: boolean;
  /** Extra bottom padding when the page renders its own sticky action bar. */
  hasStickyBar?: boolean;
}

export function AdminShell({
  children,
  mobileTitle,
  mobileBack,
  mobileMeta,
  showTabBar = true,
  hasStickyBar = false,
}: AdminShellProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-dvh w-full bg-cream">
      {/* Rail from md (icons only), full sidebar from lg. */}
      <nav
        aria-label="เมนูผู้ดูแล"
        className="sticky top-0 hidden h-dvh w-18 shrink-0 flex-col gap-1 bg-nav p-3 md:flex lg:w-[206px] lg:p-3.5"
      >
        <Link
          href="/admin"
          className="mb-3 flex items-center justify-center rounded-lg px-1 py-2 lg:justify-start lg:px-2"
        >
          {/* The rail is icon-only until lg, so the wordmark stays hidden. */}
          <Logo tone="light" wordClassName="hidden lg:inline" />
        </Link>
        <SidebarLinks pathname={pathname} />
        <div className="flex-1" />
        <ArtistChip />
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 bg-nav px-4 py-2.5 md:hidden">
          {mobileBack ? (
            <Link
              href={mobileBack.href}
              aria-label={mobileBack.label}
              className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/12 text-white"
            >
              <ArrowLeft size={16} aria-hidden="true" />
            </Link>
          ) : (
            <Logo tone="light" className="shrink-0" />
          )}
          <span className="min-w-0 flex-1 truncate font-display text-[15px] font-semibold text-white">
            {mobileTitle}
          </span>
          {mobileMeta ? (
            <span className="shrink-0 font-mono text-[11px] font-medium text-nav-mono">
              {mobileMeta}
            </span>
          ) : null}
          {!mobileBack ? (
            <button
              type="button"
              aria-label="เปิดเมนู"
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen(true)}
              className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl bg-white/12 text-white"
            >
              <Menu size={17} aria-hidden="true" />
            </button>
          ) : null}
        </header>

        <main
          className={cn(
            "min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-7.5 lg:py-6.5",
            showTabBar && "pb-24 md:pb-6",
            hasStickyBar && "pb-4",
          )}
        >
          <div className="mx-auto w-full max-w-[1180px]">{children}</div>
        </main>

        {showTabBar ? <TabBar pathname={pathname} /> : null}
      </div>

      {drawerOpen ? (
        <MobileDrawer pathname={pathname} onClose={() => setDrawerOpen(false)} />
      ) : null}
    </div>
  );
}

function SidebarLinks({ pathname }: { pathname: string }) {
  return (
    <ul className="flex flex-col gap-1">
      {ADMIN_NAV.map((item) => {
        const active = isNavItemActive(item, pathname);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              title={item.label}
              className={cn(
                "flex min-h-11 items-center justify-center gap-2.5 rounded-xl px-2 text-[13.5px] transition-colors lg:justify-start lg:px-3",
                active
                  ? "bg-white/12 font-display font-semibold text-white"
                  : "font-medium text-nav-text hover:bg-white/7 hover:text-white",
              )}
            >
              <Icon size={18} aria-hidden="true" className="shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function ArtistChip() {
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-white/6 p-2 lg:px-3">
      <span
        aria-hidden="true"
        className="grid size-7 shrink-0 place-items-center rounded-full bg-amber font-display text-xs font-bold text-ink"
      >
        M
      </span>
      <span className="hidden min-w-0 flex-col lg:flex">
        <span className="truncate text-xs font-medium text-white">Mook</span>
        <span className="font-mono text-[10px] text-nav-mono">ARTIST</span>
      </span>
    </div>
  );
}

function TabBar({ pathname }: { pathname: string }) {
  return (
    <nav
      aria-label="เมนูหลัก"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t-[1.5px] border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {ADMIN_NAV.map((item) => {
        const active = isNavItemActive(item, pathname);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-1 text-[10.5px]",
              active ? "font-semibold text-coral" : "font-medium text-subtle",
            )}
          >
            <Icon size={18} aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function MobileDrawer({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/55 animate-fade-in md:hidden"
      onClick={onClose}
    >
      <nav
        aria-label="เมนูผู้ดูแล"
        onClick={(event) => event.stopPropagation()}
        className="ml-auto flex h-full w-72 max-w-[85%] flex-col gap-1 bg-nav p-4 animate-slide-in-right"
      >
        <div className="mb-3 flex items-center justify-between">
          <Logo tone="light" />
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนู"
            className="grid size-10 cursor-pointer place-items-center rounded-xl bg-white/12 text-white"
          >
            <X size={17} aria-hidden="true" />
          </button>
        </div>

        {/* Clicking any link also dismisses the drawer. */}
        <ul className="flex flex-col gap-1" onClick={onClose}>
          {ADMIN_NAV.map((item) => {
            const active = isNavItemActive(item, pathname);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px]",
                    active
                      ? "bg-white/12 font-display font-semibold text-white"
                      : "font-medium text-nav-text",
                  )}
                >
                  <Icon size={18} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex-1" />
        <ArtistChip />
        <Link
          href="/admin/login"
          className="mt-2 flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-nav-text"
        >
          <LogOut size={18} aria-hidden="true" />
          ออกจากระบบ
        </Link>
      </nav>
    </div>
  );
}
