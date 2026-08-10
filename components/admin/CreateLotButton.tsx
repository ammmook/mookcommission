"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { lotLabel } from "@/data/lots";
import { useAdminData } from "@/lib/store/admin-store";

/** Creates a lot and closes whichever lot was previously taking queues. */
export function CreateLotButton({ compact }: { compact?: boolean }) {
  const { activeLot, createLot } = useAdminData();
  const [open, setOpen] = useState(false);
  const [capacity, setCapacity] = useState(10);

  const submit = () => {
    createLot({ capacity });
    setOpen(false);
  };

  return (
    <>
      <Button
        size={compact ? "sm" : "md"}
        onClick={() => {
          setCapacity(10);
          setOpen(true);
        }}
      >
        <Plus size={16} aria-hidden="true" />
        {compact ? "สร้าง Lot" : "สร้าง Lot ใหม่"}
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="สร้าง Lot ใหม่"
        footer={
          <>
            <Button size="lg" fullWidth onClick={submit}>
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
          ล็อตใหม่จะเริ่มนับคิวจาก 01
          {activeLot ? ` และ ${lotLabel(activeLot)} จะถูกปิดรับคิวเพิ่ม` : ""}
        </p>
        <Field label="จำนวนคิวสูงสุด" htmlFor="lot-capacity">
          <Input
            id="lot-capacity"
            type="number"
            min={1}
            max={99}
            mono
            value={capacity}
            onChange={(event) =>
              setCapacity(Math.max(1, Number(event.target.value) || 1))
            }
          />
        </Field>
      </Modal>
    </>
  );
}
