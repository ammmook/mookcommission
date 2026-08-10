"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/", label: "เช็กคิว" },
  { href: "/#how-it-works", label: "วิธีใช้งาน" },
  { href: "/#contact", label: "ติดต่อศิลปิน" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b-[1.5px] border-line bg-cream/95 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10 lg:py-4">
        <Link href="/" className="rounded-lg">
          <Logo showLatin className="hidden sm:flex" />
          <Logo className="sm:hidden" />
        </Link>

        <nav aria-label="เมนูหลัก" className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[13.5px] font-medium transition-colors hover:text-ink",
                pathname === link.href ? "text-ink" : "text-body",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/admin/login"
            className="rounded-full border-[1.5px] border-line-strong px-4 py-2 text-[12.5px] font-medium text-body transition-colors hover:border-ink hover:text-ink"
          >
            สำหรับผู้ดูแล
          </Link>
        </nav>

        <button
          type="button"
          aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="grid size-11 cursor-pointer place-items-center rounded-xl border-[1.5px] border-line-strong bg-white text-ink md:hidden"
        >
          {menuOpen ? (
            <X size={18} aria-hidden="true" />
          ) : (
            <Menu size={18} aria-hidden="true" />
          )}
        </button>
      </div>

      {menuOpen ? (
        <nav
          aria-label="เมนูมือถือ"
          // Any link inside closes the drawer, so navigation never leaves it open.
          onClick={() => setMenuOpen(false)}
          className="border-t-[1.5px] border-line bg-cream px-4 pt-2 pb-4 animate-fade-in md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-12 items-center rounded-xl px-3 text-[15px] font-medium text-ink hover:bg-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/admin/login"
                className="mt-1 flex min-h-12 items-center justify-center rounded-xl border-[1.5px] border-line-strong bg-white text-[15px] font-medium text-ink"
              >
                สำหรับผู้ดูแล
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
