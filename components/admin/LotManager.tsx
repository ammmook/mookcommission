"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { AdminPageHeading } from "./AdminPageHeading";
import { LotManageCard } from "./LotManageCard";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { lotLabel } from "@/data/lots";
import { queueTag } from "@/lib/format";
import { useAdminData, type DeleteLotPlan } from "@/lib/store/admin-store";
import type { Customer, Lot } from "@/lib/types";

const DELETE_CUSTOMERS = "__delete_customers";

export function LotManager() {
  const {
    lots,
    customers,
    filledFor,
    customersInLot,
    spaceIn,
    createLot,
    updateLot,
    deleteLot,
    removeCustomer,
  } = useAdminData();

  const [creating, setCreating] = useState(false);
  const [newCapacity, setNewCapacity] = useState(10);
  const [editing, setEditing] = useState<Lot | null>(null);
  const [editCapacity, setEditCapacity] = useState(10);
  const [deleting, setDeleting] = useState<Lot | null>(null);
  const [deletePlan, setDeletePlan] = useState("");
  const [removingCustomer, setRemovingCustomer] = useState<Customer | null>(
    null,
  );

  const openEdit = (lot: Lot) => {
    setEditing(lot);
    setEditCapacity(lot.capacity);
  };

  const openDelete = (lot: Lot) => {
    setDeleting(lot);
    setDeletePlan("");
  };

  const deletingRoster = deleting ? customersInLot(deleting.id) : [];
  const deleteTargets = deleting
    ? lots.filter(
        (lot) => lot.id !== deleting.id && spaceIn(lot.id) >= deletingRoster.length,
      )
    : [];
  const deleteReady = deletingRoster.length === 0 || deletePlan !== "";

  const confirmDelete = () => {
    if (!deleting || !deleteReady) return;
    const plan: DeleteLotPlan =
      deletingRoster.length === 0 || deletePlan === DELETE_CUSTOMERS
        ? { kind: "delete-customers" }
        : { kind: "reassign", toLotId: deletePlan };
    deleteLot(deleting.id, plan);
    setDeleting(null);
  };

  return (
    <>
      <AdminPageHeading
        title="จัดการ Lot"
        subtitle={`${lots.length} ล็อต · ${customers.length} ลูกค้าทั้งหมด`}
        action={
          <Button
            onClick={() => {
              setNewCapacity(10);
              setCreating(true);
            }}
          >
            <Plus size={16} aria-hidden="true" />
            สร้าง Lot ใหม่
          </Button>
        }
      />

      {lots.length === 0 ? (
        <p className="rounded-card border-[1.5px] border-dashed border-line-dashed bg-surface px-5 py-8 text-center text-[12.5px] text-body">
          ยังไม่มีล็อต — สร้างล็อตแรกเพื่อเริ่มรับคิว
        </p>
      ) : (
        <div className="grid gap-3.5 xl:grid-cols-2">
          {lots.map((lot) => (
            <LotManageCard
              key={lot.id}
              lot={lot}
              onEdit={openEdit}
              onDelete={openDelete}
              onRemoveCustomer={setRemovingCustomer}
            />
          ))}
        </div>
      )}

      {/* Create ------------------------------------------------------------ */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="สร้าง Lot ใหม่"
        footer={
          <>
            <Button
              size="lg"
              fullWidth
              onClick={() => {
                createLot({ capacity: newCapacity });
                setCreating(false);
              }}
            >
              สร้าง Lot
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => setCreating(false)}
            >
              ยกเลิก
            </Button>
          </>
        }
      >
        <p className="mb-4 text-[12.5px] leading-relaxed text-body">
          ล็อตใหม่จะเริ่มนับคิวจาก 01 และล็อตที่เปิดอยู่ตอนนี้จะถูกปิดรับคิวเพิ่ม
        </p>
        <Field label="จำนวนคิวสูงสุด" htmlFor="new-lot-capacity">
          <Input
            id="new-lot-capacity"
            type="number"
            min={1}
            max={99}
            mono
            value={newCapacity}
            onChange={(event) =>
              setNewCapacity(Math.max(1, Number(event.target.value) || 1))
            }
          />
        </Field>
      </Modal>

      {/* Edit capacity ----------------------------------------------------- */}
      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `แก้ไข ${lotLabel(editing)}` : ""}
        footer={
          <>
            <Button
              size="lg"
              fullWidth
              disabled={
                editing !== null && editCapacity < filledFor(editing.id)
              }
              onClick={() => {
                if (editing) updateLot(editing.id, { capacity: editCapacity });
                setEditing(null);
              }}
            >
              บันทึก
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => setEditing(null)}
            >
              ยกเลิก
            </Button>
          </>
        }
      >
        <Field label="จำนวนคิวสูงสุด" htmlFor="edit-lot-capacity">
          <Input
            id="edit-lot-capacity"
            type="number"
            min={1}
            max={99}
            mono
            value={editCapacity}
            onChange={(event) =>
              setEditCapacity(Math.max(1, Number(event.target.value) || 1))
            }
          />
        </Field>
        {editing && editCapacity < filledFor(editing.id) ? (
          <p role="alert" className="mt-2.5 text-[11.5px] font-medium text-coral-text">
            ล็อตนี้มีลูกค้าอยู่แล้ว {filledFor(editing.id)} คน —
            ลดจำนวนคิวต่ำกว่านี้ไม่ได้
          </p>
        ) : null}
      </Modal>

      {/* Delete lot -------------------------------------------------------- */}
      <Modal
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        title={deleting ? `ลบ ${lotLabel(deleting)}?` : ""}
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
              disabled={!deleteReady}
              onClick={confirmDelete}
            >
              ยืนยันลบล็อต
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => setDeleting(null)}
            >
              ย้อนกลับ
            </Button>
          </>
        }
      >
        {deletingRoster.length === 0 ? (
          <p className="text-[12.5px] leading-relaxed text-body">
            ล็อตนี้ยังไม่มีลูกค้า จึงลบได้ทันที และการลบนี้ย้อนกลับไม่ได้
          </p>
        ) : (
          <>
            <p className="text-[12.5px] leading-relaxed text-body">
              ล็อตนี้มีลูกค้าอยู่{" "}
              <strong className="text-ink">{deletingRoster.length} คน</strong>{" "}
              — เลือกก่อนว่าจะให้เกิดอะไรขึ้นกับพวกเขา
            </p>

            <div className="mt-3.5">
              <label
                htmlFor="delete-plan"
                className="mb-1.5 block text-[11.5px] font-medium text-body"
              >
                จัดการลูกค้าในล็อต
              </label>
              <select
                id="delete-plan"
                value={deletePlan}
                onChange={(event) => setDeletePlan(event.target.value)}
                className="w-full min-w-0 cursor-pointer rounded-xl border-2 border-line-strong bg-white px-3.5 py-3 text-sm font-medium text-ink outline-none focus:border-violet"
              >
                <option value="">เลือกวิธีจัดการ…</option>
                {deleteTargets.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    ย้ายทั้งหมดไป {lotLabel(lot)} (เหลือ {spaceIn(lot.id)} คิว)
                  </option>
                ))}
                <option value={DELETE_CUSTOMERS}>
                  ลบลูกค้าทั้ง {deletingRoster.length} คนออกจากระบบ
                </option>
              </select>
            </div>

            {deleteTargets.length === 0 ? (
              <p className="mt-2.5 text-[11.5px] leading-relaxed text-amber-text">
                ไม่มีล็อตอื่นที่มีที่ว่างพอสำหรับลูกค้าทั้งหมด —
                เพิ่มความจุของล็อตอื่นก่อน หรือเลือกลบลูกค้า
              </p>
            ) : null}
          </>
        )}
      </Modal>

      {/* Remove one customer ----------------------------------------------- */}
      <Modal
        open={removingCustomer !== null}
        onClose={() => setRemovingCustomer(null)}
        title={
          removingCustomer ? `ลบ ${removingCustomer.name} ออกจากระบบ?` : ""
        }
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
                if (removingCustomer) removeCustomer(removingCustomer.id);
                setRemovingCustomer(null);
              }}
            >
              ยืนยันลบลูกค้า
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => setRemovingCustomer(null)}
            >
              ย้อนกลับ
            </Button>
          </>
        }
      >
        <p className="text-[12.5px] leading-relaxed text-body">
          คิว{" "}
          <strong className="text-ink">
            {removingCustomer ? queueTag(removingCustomer.queueNumber) : ""}
          </strong>{" "}
          และข้อมูลงานทั้งหมดจะถูกลบถาวร
          หากต้องการเก็บประวัติไว้ให้ใช้ “ยกเลิกงาน” ในหน้าลูกค้าแทน
        </p>
      </Modal>
    </>
  );
}
