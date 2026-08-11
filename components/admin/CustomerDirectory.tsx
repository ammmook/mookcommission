"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { CustomerCard } from "./CustomerCard";
import { CustomerTable } from "./CustomerTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl, type Segment } from "@/components/ui/SegmentedControl";
import { Select } from "@/components/ui/Field";
import { lotLabel } from "@/data/lots";
import { STAGE_ORDER, STAGE_META } from "@/lib/stages";
import { useAdminData } from "@/lib/store/admin-store";

const ALL = "all";

/** Status filter values: every stage plus the two lifecycle states. */
const statusOptions = [
  { value: ALL, label: "ทั้งหมด" },
  ...STAGE_ORDER.map((stage) => ({
    value: stage,
    label: STAGE_META[stage].th,
  })),
  { value: "paused", label: "หยุดชั่วคราว" },
  { value: "cancelled", label: "ยกเลิกแล้ว" },
];

export function CustomerDirectory({
  currentQueueNumber,
  addButton,
}: {
  /** Null when no lot is open, or the open lot has nothing in progress. */
  currentQueueNumber: number | null;
  addButton: React.ReactNode;
}) {
  const { lots, customers, activeLot } = useAdminData();
  const [query, setQuery] = useState("");
  const [lotFilter, setLotFilter] = useState(ALL);
  const [status, setStatus] = useState(ALL);

  const lotSegments: Segment[] = [
    { value: ALL, label: "ทั้งหมด" },
    ...lots.map((lot) => ({ value: lot.id, label: lotLabel(lot) })),
  ];

  // Newest lot first, then by queue number — matches "เรียงตามเลขคิว".
  // Lot ids are numeric strings, so they are compared as numbers; a string
  // compare would put Lot 10 before Lot 9.
  const sorted = useMemo(
    () =>
      [...customers].sort(
        (a, b) =>
          Number(b.lotId) - Number(a.lotId) || a.queueNumber - b.queueNumber,
      ),
    [customers],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((customer) => {
      if (lotFilter !== ALL && customer.lotId !== lotFilter) return false;

      if (status !== ALL) {
        const matchesState = customer.state === status;
        const matchesStage =
          customer.state === "active" && customer.stage === status;
        if (!matchesState && !matchesStage) return false;
      }

      if (!q) return true;
      return (
        customer.name.toLowerCase().includes(q) ||
        customer.code.toLowerCase().includes(q)
      );
    });
  }, [sorted, query, lotFilter, status]);

  return (
    <>
      <form
        onSubmit={(event) => event.preventDefault()}
        className="mb-4 flex flex-col gap-2.5 lg:flex-row lg:items-center"
      >
        <div className="relative min-w-0 lg:flex-1">
          <Search
            size={16}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle"
          />
          <label htmlFor="customer-search" className="sr-only">
            ค้นหาชื่อหรือรหัสคิว
          </label>
          <input
            id="customer-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาชื่อหรือรหัสคิว"
            className="w-full min-w-0 rounded-xl border-2 border-line-strong bg-white py-3 pr-3.5 pl-10 text-sm text-ink outline-none placeholder:text-subtle focus:border-violet"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <SegmentedControl
            label="กรองตาม Lot"
            segments={lotSegments}
            value={lotFilter}
            onChange={setLotFilter}
            className="min-w-0 flex-1 lg:flex-none"
          />

          {/* The status select folds into the same row on desktop and sits
              beside the lot filter on phones. */}
          <label className="hidden items-center gap-2 lg:flex">
            <span className="shrink-0 text-xs text-subtle">สถานะ</span>
            <Select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-auto py-2.5"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </label>

          <label className="shrink-0 lg:hidden">
            <span className="sr-only">กรองตามสถานะ</span>
            <span className="relative grid size-11 place-items-center rounded-xl border-2 border-line-strong bg-white text-ink">
              <SlidersHorizontal size={16} aria-hidden="true" />
              <Select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                aria-label="กรองตามสถานะ"
                className="absolute inset-0 size-full cursor-pointer rounded-xl border-none bg-transparent p-0 text-transparent opacity-0"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </span>
          </label>
        </div>
      </form>

      {visible.length === 0 ? (
        <EmptyState
          dashed
          visual={
            <span
              aria-hidden="true"
              className="grid size-17.5 place-items-center rounded-2xl art-hatch-sm text-2xl"
            >
              🗂
            </span>
          }
          title="ยังไม่มีลูกค้าที่ตรงกับตัวกรอง"
          description="ลองล้างคำค้นหรือเลือก Lot อื่น — หรือเพิ่มลูกค้าคนแรก แล้วระบบจะออกเลขคิวให้อัตโนมัติ"
          action={addButton}
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <CustomerTable
              customers={visible}
              currentQueueNumber={currentQueueNumber}
              activeLotId={activeLot?.id}
              lots={lots}
            />
          </div>
          <ul className="flex flex-col gap-3 lg:hidden">
            {visible.map((customer) => (
              <li key={customer.id}>
                <CustomerCard
                  customer={customer}
                  lot={lots.find((lot) => lot.id === customer.lotId)}
                  isCurrent={
                    currentQueueNumber !== null &&
                    customer.queueNumber === currentQueueNumber &&
                    customer.lotId === activeLot?.id
                  }
                />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
