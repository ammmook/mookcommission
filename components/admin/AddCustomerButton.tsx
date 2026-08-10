"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormGrid, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { lotLabel } from "@/data/lots";
import { useAdminData } from "@/lib/store/admin-store";
import { CODE_MAX_LENGTH } from "@/lib/supabase/queues";

const blank = {
  name: "",
  code: "",
  type: "",
  characters: 1,
  note: "",
  email: "",
};

export function AddCustomerButton({ compact }: { compact?: boolean }) {
  const { lots, activeLot, spaceIn, addCustomer, busy, commissionTypes } =
    useAdminData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [lotId, setLotId] = useState(activeLot?.id ?? lots[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  const start = () => {
    setForm({ ...blank, type: commissionTypes[0] ?? "" });
    setLotId(activeLot?.id ?? lots[0]?.id ?? "");
    setError(null);
    setOpen(true);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      setError("กรุณากรอกชื่อและรหัสค้นหา");
      return;
    }
    // The queue number is issued by the database trigger, so nothing is
    // computed here — the store just reports back whatever it refused.
    const message = await addCustomer({ ...form, lotId });
    if (message) {
      setError(message);
      return;
    }
    setOpen(false);
  };

  return (
    <>
      <Button size={compact ? "sm" : "md"} onClick={start} disabled={lots.length === 0}>
        <Plus size={16} aria-hidden="true" />
        {compact ? "เพิ่ม" : "เพิ่มลูกค้า"}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="เพิ่มลูกค้าใหม่"
        footer={
          <>
            <Button size="lg" fullWidth onClick={submit} disabled={busy}>
              {busy ? "กำลังเพิ่ม…" : "เพิ่มลูกค้า"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => setOpen(false)}
            >
              ยกเลิก
            </Button>
          </>
        }
      >
        <p className="mb-4 text-[12.5px] leading-relaxed text-body">
          ระบบจะออกเลขคิวว่างถัดไปในล็อตที่เลือกให้อัตโนมัติ
        </p>

        <FormGrid>
          <Field label="ชื่อลูกค้า" htmlFor="new-name">
            <Input
              id="new-name"
              value={form.name}
              placeholder="เช่น Mook"
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
            />
          </Field>
          <Field label="รหัสค้นหา" htmlFor="new-code">
            <Input
              id="new-code"
              value={form.code}
              placeholder="ตั้งรหัสเองได้ เช่น MK001"
              maxLength={CODE_MAX_LENGTH}
              mono
              onChange={(event) =>
                setForm({ ...form, code: event.target.value })
              }
            />
          </Field>
          <Field label="ล็อต" htmlFor="new-lot" full>
            <Select
              id="new-lot"
              value={lotId}
              onChange={(event) => setLotId(event.target.value)}
            >
              {lots.map((lot) => {
                const space = spaceIn(lot.id);
                return (
                  <option key={lot.id} value={lot.id} disabled={space === 0}>
                    {lotLabel(lot)} · เหลือ {space} คิว
                    {lot.status === "closed" ? " (ปิดแล้ว)" : ""}
                  </option>
                );
              })}
            </Select>
          </Field>
          <Field label="ประเภทงาน" htmlFor="new-type">
            <Select
              id="new-type"
              value={form.type}
              onChange={(event) =>
                setForm({ ...form, type: event.target.value })
              }
            >
              {commissionTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="อีเมลลูกค้า" htmlFor="new-email" full>
            <Input
              id="new-email"
              type="email"
              value={form.email}
              placeholder="name@example.com"
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
            />
          </Field>
          <Field label="จำนวนตัวละคร" htmlFor="new-characters">
            <Input
              id="new-characters"
              type="number"
              min={1}
              mono
              value={form.characters}
              onChange={(event) =>
                setForm({
                  ...form,
                  characters: Math.max(1, Number(event.target.value) || 1),
                })
              }
            />
          </Field>
          <Field label="หมายเหตุ" htmlFor="new-note" full>
            <Textarea
              id="new-note"
              rows={2}
              value={form.note}
              placeholder="รายละเอียดเพิ่มเติม"
              onChange={(event) =>
                setForm({ ...form, note: event.target.value })
              }
            />
          </Field>
        </FormGrid>

        {error ? (
          <p role="alert" className="mt-3 text-[11.5px] font-medium text-coral-text">
            {error}
          </p>
        ) : null}
      </Modal>
    </>
  );
}
