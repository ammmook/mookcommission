"use client";

import Link from "next/link";
import {
  ChevronDown,
  Lock,
  LockOpen,
  Pencil,
  Trash2,
  UserRoundX,
} from "lucide-react";
import { useId, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StagePill } from "@/components/ui/StatusPill";
import { lotLabel } from "@/data/lots";
import { cn } from "@/lib/cn";
import { queueTag } from "@/lib/format";
import { useAdminData } from "@/lib/store/admin-store";
import type { Customer, Lot } from "@/lib/types";

interface LotManageCardProps {
  lot: Lot;
  onEdit: (lot: Lot) => void;
  onDelete: (lot: Lot) => void;
  onRemoveCustomer: (customer: Customer) => void;
}

/** One lot, with its roster expandable underneath. */
export function LotManageCard({
  lot,
  onEdit,
  onDelete,
  onRemoveCustomer,
}: LotManageCardProps) {
  const { customersInLot, filledFor, setLotStatus } = useAdminData();
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const roster = customersInLot(lot.id);
  const filled = filledFor(lot.id);
  const active = lot.status === "active";

  return (
    <article
      className={cn(
        "rounded-card border-[1.5px] border-l-5 border-line bg-surface",
        active ? "border-l-teal" : "border-l-ghost",
      )}
    >
      <div className="p-4 sm:px-5">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
          <h3
            className={cn(
              "text-base font-semibold",
              active ? "text-ink" : "text-body",
            )}
          >
            {lotLabel(lot)}
          </h3>
          {active ? (
            <Badge mono toneClass="bg-teal-bg text-teal-text" dotClass="bg-teal">
              ACTIVE
            </Badge>
          ) : (
            <Badge mono>CLOSED</Badge>
          )}
          <span
            className={cn(
              "ml-auto font-mono text-xs font-medium",
              filled > lot.capacity ? "text-coral-text" : "text-body",
            )}
          >
            {filled} / {lot.capacity}
          </span>
        </div>

        <p className="mt-2 mb-2.5 text-xs text-subtle">
          {lot.queueRange} · {lot.dateLabel}
        </p>

        <ProgressBar
          value={filled}
          total={lot.capacity}
          label={`ความคืบหน้า ${lotLabel(lot)}`}
          fillClass={active ? "bg-linear-to-r from-teal to-sky" : "bg-ghost"}
        />

        <div className="mt-3.5 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLotStatus(lot.id, active ? "closed" : "active")}
          >
            {active ? (
              <>
                <Lock size={14} aria-hidden="true" />
                ปิดล็อต
              </>
            ) : (
              <>
                <LockOpen size={14} aria-hidden="true" />
                เปิดล็อตอีกครั้ง
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onEdit(lot)}>
            <Pencil size={14} aria-hidden="true" />
            แก้ไข
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(lot)}>
            <Trash2 size={14} aria-hidden="true" />
            ลบล็อต
          </Button>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={panelId}
            className="ml-auto flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl px-2.5 text-[12.5px] font-medium text-body transition-colors hover:text-ink"
          >
            ลูกค้า {roster.length} คน
            <ChevronDown
              size={15}
              aria-hidden="true"
              className={cn("transition-transform", open && "rotate-180")}
            />
          </button>
        </div>
      </div>

      {open ? (
        <div
          id={panelId}
          className="border-t-[1.5px] border-line px-4 py-3.5 sm:px-5"
        >
          {roster.length === 0 ? (
            <p className="py-3 text-center text-[12.5px] text-subtle">
              ยังไม่มีลูกค้าในล็อตนี้
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {roster.map((customer) => (
                <LotCustomerRow
                  key={customer.id}
                  customer={customer}
                  currentLot={lot}
                  onRemove={() => onRemoveCustomer(customer)}
                />
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </article>
  );
}

function LotCustomerRow({
  customer,
  currentLot,
  onRemove,
}: {
  customer: Customer;
  currentLot: Lot;
  onRemove: () => void;
}) {
  const { lots, spaceIn, moveCustomer } = useAdminData();
  const selectId = useId();
  const [error, setError] = useState<string | null>(null);

  const targets = lots.filter((lot) => lot.id !== currentLot.id);

  return (
    <li className="rounded-2xl border-[1.5px] border-line bg-surface-muted p-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-display text-lg font-bold text-ink">
          {queueTag(customer.queueNumber)}
        </span>
        <Link
          href={`/admin/customers/${customer.code}`}
          className="min-w-0 flex-1 hover:underline"
        >
          <span className="block truncate font-display text-sm font-semibold text-ink">
            {customer.name}
          </span>
          <span className="font-mono text-[11px] font-medium text-subtle">
            {customer.code}
          </span>
        </Link>
        <StagePill customer={customer} />
      </div>

      <div className="mt-2.5 flex items-end gap-2">
        <span className="min-w-0 flex-1">
          <label
            htmlFor={selectId}
            className="mb-1 block text-[11px] font-medium text-subtle"
          >
            ย้ายไปล็อต
          </label>
          <select
            id={selectId}
            value=""
            onChange={(event) => {
              const toLotId = event.target.value;
              if (!toLotId) return;
              const ok = moveCustomer(customer.id, toLotId);
              setError(ok ? null : "ล็อตปลายทางเต็มแล้ว");
            }}
            className="w-full min-w-0 cursor-pointer rounded-xl border-2 border-line-strong bg-white px-3 py-2.5 text-[13px] font-medium text-ink outline-none focus:border-violet"
          >
            <option value="">เลือกล็อตปลายทาง…</option>
            {targets.map((lot) => {
              const space = spaceIn(lot.id);
              return (
                <option key={lot.id} value={lot.id} disabled={space === 0}>
                  {lotLabel(lot)} · เหลือ {space} คิว
                </option>
              );
            })}
          </select>
        </span>

        <button
          type="button"
          onClick={onRemove}
          aria-label={`ลบลูกค้า ${customer.name} ออกจากระบบ`}
          className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl border-[1.5px] border-line bg-white text-coral-text transition-colors hover:border-coral-border hover:bg-coral-bg"
        >
          <UserRoundX size={16} aria-hidden="true" />
        </button>
      </div>

      {error ? (
        <p role="alert" className="mt-2 text-[11.5px] font-medium text-coral-text">
          {error}
        </p>
      ) : null}
    </li>
  );
}
