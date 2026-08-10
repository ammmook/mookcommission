"use client";

import Link from "next/link";
import { ArrowLeft, Check, Pause, Play, X } from "lucide-react";
import { useState } from "react";
import { AdminPageHeading } from "./AdminPageHeading";
import { SketchManager } from "./SketchManager";
import { StageSelector } from "./StageSelector";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, FormGrid, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Toggle } from "@/components/ui/Toggle";
import { lotLabel } from "@/data/lots";
import { baht, queueTag } from "@/lib/format";
import { STAGE_META, STATE_META } from "@/lib/stages";
import type {
  Customer,
  HistoryEntry,
  Lot,
  PaymentStatus,
  QueueState,
  Quotation,
  Stage,
} from "@/lib/types";

const historyDotClasses: Record<HistoryEntry["tone"], string> = {
  violet: "bg-violet",
  teal: "bg-teal",
  amber: "bg-amber",
  coral: "bg-coral",
};

interface CustomerEditorProps {
  customer: Customer;
  lot: Lot;
  quotation?: Quotation;
}

/**
 * Local-state editor for one customer. Every control is live but nothing is
 * persisted — swapping `useState` for server actions is the next step.
 */
export function CustomerEditor({ customer, lot, quotation }: CustomerEditorProps) {
  const [stage, setStage] = useState<Stage>(customer.stage);
  const [state, setState] = useState<QueueState>(customer.state);
  const [payment, setPayment] = useState<PaymentStatus>(customer.payment);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [saved, setSaved] = useState(false);

  const paused = state === "paused";
  const cancelled = state === "cancelled";

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  };

  const statusBadge = cancelled ? (
    <Badge toneClass={STATE_META.cancelled.tone.pill}>
      ✕ {STATE_META.cancelled.th}
    </Badge>
  ) : paused ? (
    <Badge toneClass={STATE_META.paused.tone.pill}>⏸ {STATE_META.paused.th}</Badge>
  ) : (
    <Badge
      toneClass={STAGE_META[stage].tone.pill}
      dotClass={STAGE_META[stage].tone.dot}
    >
      {STAGE_META[stage].th}
    </Badge>
  );

  const queueControls = (
    <>
      <Button
        variant="warning"
        onClick={() => setState(paused ? "active" : "paused")}
        className="sm:w-auto"
      >
        {paused ? (
          <>
            <Play size={15} aria-hidden="true" />
            กลับมาดำเนินการ
          </>
        ) : (
          <>
            <Pause size={15} aria-hidden="true" />
            หยุดคิวชั่วคราว
          </>
        )}
      </Button>
      <Button
        variant="danger"
        onClick={() =>
          cancelled ? setState("active") : setConfirmCancel(true)
        }
        className="sm:w-auto"
      >
        <X size={15} aria-hidden="true" />
        {cancelled ? "คืนสถานะงาน" : "ยกเลิกงาน"}
      </Button>
    </>
  );

  return (
    <>
      <Link
        href="/admin/customers"
        className="hidden items-center gap-1.5 text-[12.5px] font-medium text-body transition-colors hover:text-ink md:inline-flex"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        กลับรายชื่อลูกค้า
      </Link>

      <AdminPageHeading
        title={
          <span className="flex flex-wrap items-center gap-x-3.5 gap-y-2">
            <span className="font-display text-3xl font-bold text-ink">
              {queueTag(customer.queueNumber)}
            </span>
            <span>
              <span className="block text-xl font-bold text-ink">
                {customer.name}
              </span>
              <span className="font-mono text-[11.5px] font-medium text-subtle">
                {customer.code} · {lotLabel(lot).toUpperCase()}
              </span>
            </span>
            {statusBadge}
          </span>
        }
        action={
          <div className="hidden gap-2.5 md:flex">
            {queueControls}
            <Button variant="dark" onClick={save}>
              {saved ? (
                <>
                  <Check size={15} aria-hidden="true" />
                  บันทึกแล้ว
                </>
              ) : (
                "บันทึก"
              )}
            </Button>
          </div>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-5">
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader title="ขั้นตอนงาน" hint="— กดเพื่อเปลี่ยนสถานะ" />
            <StageSelector value={stage} onChange={setStage} />
          </Card>

          <Card>
            <SketchManager initial={customer.sketches} />
          </Card>

          <Card>
            <CardHeader title="รายละเอียดงาน / Commission" />
            <FormGrid>
              <Field label="ประเภทงาน" htmlFor="edit-type">
                <Select id="edit-type" defaultValue={customer.commission.type}>
                  <option>Bust</option>
                  <option>Half Body</option>
                  <option>Full Body</option>
                </Select>
              </Field>
              <Field label="จำนวนตัวละคร" htmlFor="edit-characters">
                <Input
                  id="edit-characters"
                  type="number"
                  min={1}
                  defaultValue={customer.commission.characters}
                  mono
                />
              </Field>
              <Field label="ขนาดไฟล์" htmlFor="edit-dimensions">
                <Input
                  id="edit-dimensions"
                  defaultValue={customer.commission.dimensions}
                  mono
                />
              </Field>
              <Field label="รหัสค้นหา" htmlFor="edit-code">
                <Input id="edit-code" defaultValue={customer.code} mono />
              </Field>
              <Field label="หมายเหตุ" htmlFor="edit-note" full>
                <Textarea
                  id="edit-note"
                  rows={2}
                  defaultValue={customer.commission.note}
                />
              </Field>
            </FormGrid>
          </Card>

          {/* Queue controls live in the header on desktop; phones get a card. */}
          <Card className="flex flex-col gap-2.5 md:hidden">
            <CardHeader title="ควบคุมคิว" className="mb-0" />
            {queueControls}
          </Card>
        </div>

        <aside className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader title="การชำระเงิน" />
            <div
              className={
                payment === "paid"
                  ? "flex items-center gap-3 rounded-2xl border-[1.5px] border-teal-border bg-teal-bg px-4 py-3.5"
                  : "flex items-center gap-3 rounded-2xl border-[1.5px] border-amber-border bg-amber-bg px-4 py-3.5"
              }
            >
              <span
                aria-hidden="true"
                className={`size-2.75 shrink-0 rounded-full ${payment === "paid" ? "bg-teal" : "bg-amber"}`}
              />
              <span className="min-w-0 flex-1">
                <strong
                  className={`block font-display text-sm font-semibold ${payment === "paid" ? "text-teal-text" : "text-amber-text"}`}
                >
                  {payment === "paid" ? "ชำระแล้ว" : "ยังไม่ชำระ"}
                </strong>
                <span
                  className={`text-[11.5px] ${payment === "paid" ? "text-teal-mid" : "text-amber-text"}`}
                >
                  {customer.amount === null
                    ? "ยังไม่มียอด"
                    : `${baht(customer.amount)}${payment === "paid" && customer.paidDateLabel ? ` · ${customer.paidDateLabel}` : ""}`}
                </span>
              </span>
              <Toggle
                checked={payment === "paid"}
                onChange={(next) => setPayment(next ? "paid" : "unpaid")}
                label="สลับสถานะการชำระเงิน"
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="ใบเสนอราคา" />
            {quotation ? (
              <>
                <Badge
                  mono
                  toneClass={
                    quotation.status === "issued"
                      ? "bg-teal-bg text-teal-text"
                      : "bg-amber-bg text-amber-text"
                  }
                >
                  {quotation.status === "issued" ? "ISSUED" : "DRAFT"} ·{" "}
                  {quotation.number}
                </Badge>
                <p className="mt-3 mb-3.5 text-xs leading-relaxed text-subtle">
                  {quotation.status === "issued"
                    ? `ส่งให้ลูกค้าแล้วเมื่อ ${quotation.issuedLabel} · ล็อกการแก้ไขตามเงื่อนไข`
                    : "ยังเป็นฉบับร่าง แก้ไขได้จนกว่าจะกดออกใบ"}
                </p>
              </>
            ) : (
              <p className="mb-3.5 text-xs leading-relaxed text-subtle">
                ยังไม่มีใบเสนอราคา — ออกใบได้หลังจากร่างภาพเสร็จ
              </p>
            )}
            <LinkButton
              href={`/admin/customers/${customer.queueNumber}/quotation`}
              variant="outline"
              fullWidth
              className="border-2 border-ink"
            >
              {quotation ? "เปิดใบเสนอราคา" : "สร้างใบเสนอราคา"}
            </LinkButton>
          </Card>

          {customer.history.length > 0 ? (
            <Card className="bg-surface-muted">
              <CardHeader title="ประวัติ" />
              <ol className="flex flex-col gap-2.5">
                {customer.history.map((entry) => (
                  <li key={entry.id} className="flex items-baseline gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`size-1.75 shrink-0 rounded-full ${historyDotClasses[entry.tone]}`}
                    />
                    <span className="text-xs text-body">
                      {entry.label}{" "}
                      <span className="font-mono text-[10.5px] text-faint">
                        {entry.dateLabel}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </Card>
          ) : null}
        </aside>
      </div>

      <StickyActionBar>
        <Button variant="dark" size="lg" fullWidth onClick={save}>
          {saved ? "บันทึกแล้ว ✓" : "บันทึกการเปลี่ยนแปลง"}
        </Button>
      </StickyActionBar>

      <Modal
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title={`ยกเลิกงานของ ${customer.name}?`}
        icon={
          <span
            aria-hidden="true"
            className="mb-3.5 grid size-13 place-items-center rounded-2xl bg-coral-bg text-[22px]"
          >
            ⚠️
          </span>
        }
        footer={
          <>
            <Button
              variant="danger-solid"
              size="lg"
              fullWidth
              onClick={() => {
                setState("cancelled");
                setConfirmCancel(false);
              }}
            >
              <X size={16} aria-hidden="true" />
              ยืนยันยกเลิกงาน
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => setConfirmCancel(false)}
            >
              ย้อนกลับ
            </Button>
          </>
        }
      >
        <p className="text-[12.5px] leading-relaxed text-body">
          เลขคิว{" "}
          <strong className="text-ink">{queueTag(customer.queueNumber)}</strong>{" "}
          จะยังคงอยู่ในระบบ แต่สถานะจะเปลี่ยนเป็น “ยกเลิกแล้ว”
          และลูกค้าจะเห็นสถานะนี้ทันที
        </p>
      </Modal>
    </>
  );
}
