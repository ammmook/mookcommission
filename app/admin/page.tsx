import Link from "next/link";
import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { ActionItemList } from "@/components/admin/ActionItemList";
import { AdminPageHeading } from "@/components/admin/AdminPageHeading";
import { CreateLotButton } from "@/components/admin/CreateLotButton";
import { LotBreakdown } from "@/components/admin/LotBreakdown";
import { LotCard } from "@/components/admin/LotCard";
import { StatStrip, type Stat } from "@/components/admin/StatStrip";
import { actionItems, dashboardStats, todayLabel } from "@/data/dashboard";
import { activeLot, lots, lotLabel } from "@/data/lots";
import { baht } from "@/lib/format";

export const metadata: Metadata = { title: "แดชบอร์ด" };

export default function AdminDashboardPage() {
  const stats: Stat[] = [
    {
      id: "lot",
      eyebrow: "ACTIVE LOT",
      value: lotLabel(activeLot),
      detail: `${activeLot.filled} / ${activeLot.capacity} คิว`,
    },
    {
      id: "current",
      eyebrow: "คิวปัจจุบัน",
      value: dashboardStats.currentQueueLabel,
      detail: dashboardStats.currentQueueDetail,
      valueClass: "text-amber",
    },
    {
      id: "waiting",
      eyebrow: "รอคิว",
      value: String(dashboardStats.waiting),
      detail: "คน",
    },
    {
      id: "done",
      eyebrow: "เสร็จแล้ว",
      value: String(dashboardStats.completedThisMonth),
      detail: "เดือนนี้",
      valueClass: "text-teal",
    },
    {
      id: "outstanding",
      eyebrow: "รอชำระเงิน",
      value: baht(dashboardStats.outstandingAmount),
      detail: `${dashboardStats.outstandingCount} ใบเสนอราคา`,
      valueClass: "text-coral-light",
    },
  ];

  return (
    <AdminShell mobileTitle="แดชบอร์ด">
      <AdminPageHeading
        title="ภาพรวมวันนี้"
        subtitle={`${todayLabel} · ${lotLabel(activeLot)} กำลังเปิด`}
        action={<CreateLotButton />}
      />

      <StatStrip stats={stats} />

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold text-ink">Lot ทั้งหมด</h2>
            <Link
              href="/admin/lots"
              className="text-xs font-medium text-violet hover:underline"
            >
              ดูทั้งหมด →
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {lots.map((lot) => (
              <LotCard key={lot.id} lot={lot} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-ink">ต้องจัดการ</h2>
          <ActionItemList items={actionItems} />

          <h2 className="mt-5 mb-3 text-base font-semibold text-ink">
            สถานะใน {lotLabel(activeLot)}
          </h2>
          <LotBreakdown />
        </section>
      </div>
    </AdminShell>
  );
}
