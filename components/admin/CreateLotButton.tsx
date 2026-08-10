"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { activeLot } from "@/data/lots";

/** Opens a mock "new lot" dialog. Submitting just closes it for now. */
export function CreateLotButton({ compact }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size={compact ? "sm" : "md"} onClick={() => setOpen(true)}>
        <Plus size={16} aria-hidden="true" />
        {compact ? "สร้าง Lot" : "สร้าง Lot ใหม่"}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="สร้าง Lot ใหม่"
        footer={
          <>
            <Button size="lg" fullWidth onClick={() => setOpen(false)}>
              สร้าง Lot
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
          Lot ใหม่จะเริ่มนับคิวจาก 01 และ {`Lot ${String(activeLot.number).padStart(2, "0")}`}{" "}
          จะถูกปิดรับคิวเพิ่ม
        </p>
        <div className="flex flex-col gap-3.5">
          <Field label="ชื่อ Lot" htmlFor="lot-name">
            <Input
              id="lot-name"
              defaultValue={`Lot ${String(activeLot.number + 1).padStart(2, "0")}`}
            />
          </Field>
          <Field label="จำนวนคิวสูงสุด" htmlFor="lot-capacity">
            <Input id="lot-capacity" type="number" defaultValue={10} min={1} mono />
          </Field>
          <Field label="วันที่เปิดรับ" htmlFor="lot-open">
            <Input id="lot-open" type="date" mono />
          </Field>
        </div>
      </Modal>
    </>
  );
}
