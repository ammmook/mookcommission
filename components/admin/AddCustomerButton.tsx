"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, FormGrid, Input, Select, Textarea } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { activeLot, lotLabel } from "@/data/lots";

/** Mock "add customer" dialog — the form is live but nothing is persisted. */
export function AddCustomerButton({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size={compact ? "sm" : "md"} onClick={() => setOpen(true)}>
        <Plus size={16} aria-hidden="true" />
        {compact ? "เพิ่ม" : "เพิ่มลูกค้า"}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="เพิ่มลูกค้าใหม่"
        footer={
          <>
            <Button size="lg" fullWidth onClick={() => setOpen(false)}>
              เพิ่มลูกค้า
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
          ลูกค้าจะถูกเพิ่มเข้า {lotLabel(activeLot)} และได้เลขคิวถัดไปอัตโนมัติ
        </p>
        <FormGrid>
          <Field label="ชื่อลูกค้า" htmlFor="new-name">
            <Input id="new-name" placeholder="เช่น Mook" required />
          </Field>
          <Field label="รหัสค้นหา" htmlFor="new-code">
            <Input id="new-code" placeholder="MK001" mono />
          </Field>
          <Field label="ประเภทงาน" htmlFor="new-type">
            <Select id="new-type" defaultValue="Half Body">
              <option>Bust</option>
              <option>Half Body</option>
              <option>Full Body</option>
            </Select>
          </Field>
          <Field label="จำนวนตัวละคร" htmlFor="new-characters">
            <Input id="new-characters" type="number" defaultValue={1} min={1} mono />
          </Field>
          <Field label="หมายเหตุ" htmlFor="new-note" full>
            <Textarea id="new-note" rows={2} placeholder="รายละเอียดเพิ่มเติม" />
          </Field>
        </FormGrid>
      </Modal>
    </>
  );
}
