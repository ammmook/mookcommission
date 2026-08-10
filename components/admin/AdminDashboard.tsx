"use client";

import Link from "next/link";
import { ActionItemList } from "./ActionItemList";
import { AdminPageHeading } from "./AdminPageHeading";
import { CreateLotButton } from "./CreateLotButton";
import { LotBreakdown } from "./LotBreakdown";
import { LotCard } from "./LotCard";
import { StatStrip, type Stat } from "./StatStrip";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/Button";
import { actionItems, dashboardStats, todayLabel } from "@/data/dashboard";
import { lotLabel } from "@/data/lots";
import { baht } from "@/lib/format";
import { useAdminData } from "@/lib/store/admin-store";

export function AdminDashboard() {
  const { lots, activeLot, filledFor, customersInLot } = useAdminData();

  // Only surface action items whose customer still exists.
  const roster = activeLot ? customersInLot(activeLot.id) : [];
  const liveActions = actionItems.filter((item) =>
    roster.some((customer) => item.href.includes(customer.code)),
  );

  const stats: Stat[] = [
    {
      id: "lot",
      eyebrow: "ACTIVE LOT",
      value: activeLot ? lotLabel(activeLot) : "—",
      detail: activeLot
        ? `${filledFor(activeLot.id)} / ${activeLot.capacity} คิว`
        : "ไม่มีล็อตที่เปิดอยู่",
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
    <>
      <AdminPageHeading
        title="ภาพรวมวันนี้"
        subtitle={
          activeLot
            ? `${todayLabel} · ${lotLabel(activeLot)} กำลังเปิด`
            : `${todayLabel} · ยังไม่มีล็อตที่เปิดรับคิว`
        }
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
              จัดการ Lot →
            </Link>
          </div>

          {lots.length === 0 ? (
            <EmptyState
              dashed
              title="ยังไม่มีล็อต"
              description="สร้างล็อตแรกเพื่อเริ่มรับคิวจากลูกค้า"
              action={
                <LinkButton href="/admin/lots" size="lg">
                  ไปหน้าจัดการ Lot
                </LinkButton>
              }
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {lots.map((lot) => (
                <LotCard key={lot.id} lot={lot} filled={filledFor(lot.id)} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-ink">ต้องจัดการ</h2>
          {liveActions.length > 0 ? (
            <ActionItemList items={liveActions} />
          ) : (
            <p className="rounded-2xl border-[1.5px] border-line bg-surface px-4 py-5 text-center text-[12.5px] text-subtle">
              ไม่มีรายการค้างอยู่ตอนนี้
            </p>
          )}

          {activeLot ? (
            <>
              <h2 className="mt-5 mb-3 text-base font-semibold text-ink">
                สถานะใน {lotLabel(activeLot)}
              </h2>
              <LotBreakdown customers={roster} />
            </>
          ) : null}
        </section>
      </div>
    </>
  );
}
