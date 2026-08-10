import Link from "next/link";
import type { Metadata } from "next";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { ArtPlaceholder } from "@/components/ui/ArtPlaceholder";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "เข้าสู่ระบบผู้ดูแล" };

export default function AdminLoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-canvas p-4 sm:p-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-3xl shadow-[0_4px_18px_rgba(43,35,64,.08)] lg:grid-cols-2">
        <section className="flex flex-col justify-center bg-cream px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <span className="flex items-center gap-2.5">
            <Logo size="md" />
            <span className="font-mono text-[10.5px] font-medium text-subtle">
              ADMIN
            </span>
          </span>

          {/* Decorative panel is beside the form on desktop, above it on phones. */}
          <ArtPlaceholder
            label="ILLUSTRATION"
            hatch={false}
            dashed={false}
            className="mt-5 h-32 rounded-2xl border-none bg-linear-150 from-ink to-[#5A3F7A] text-white/55 lg:hidden"
          />

          <h1 className="mt-6 text-2xl leading-tight font-bold text-ink sm:text-[28px]">
            ยินดีต้อนรับกลับมา
          </h1>
          <p className="mt-1.5 text-[13px] text-body">
            เข้าสู่ระบบเพื่อจัดการคิวและลูกค้า
          </p>

          <AdminLoginForm className="mt-6" />

          <p className="mt-4 text-[11.5px] text-subtle">
            <a href="#" className="text-violet hover:underline">
              ลืมรหัสผ่าน?
            </a>{" "}
            ·{" "}
            <Link href="/" className="text-violet hover:underline">
              กลับหน้าลูกค้า
            </Link>
          </p>
        </section>

        <aside
          aria-hidden="true"
          className="relative hidden place-items-center overflow-hidden bg-linear-150 from-ink to-[#5A3F7A] p-8 lg:grid"
        >
          <span className="absolute -top-8 -left-8 size-37.5 rounded-full bg-amber/18" />
          <span className="absolute -right-5 -bottom-10 size-47.5 rounded-full bg-coral/16" />
          <div className="relative text-center">
            <ArtPlaceholder
              label="ILLUSTRATION"
              hatch={false}
              dashed={false}
              className="mx-auto size-45 rounded-3xl border-[1.5px] border-dashed border-white/30 bg-white/5 text-white/55 animate-float"
            />
            <p className="mt-4.5 text-[13px] leading-relaxed text-white/80">
              จัดคิว ออกใบเสนอราคา
              <br />
              และอัปเดตลูกค้าได้ในที่เดียว
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
