import Link from "next/link";
import { PaymentPill, StagePill } from "@/components/ui/StatusPill";
import { cn } from "@/lib/cn";
import { queueTag } from "@/lib/format";
import type { Customer, Lot } from "@/lib/types";

const headings = [
  { key: "queue", label: "คิว", align: "left" },
  { key: "name", label: "ชื่อ", align: "left" },
  { key: "code", label: "รหัส", align: "left" },
  { key: "lot", label: "LOT", align: "left" },
  { key: "stage", label: "ขั้นตอน", align: "left" },
  { key: "payment", label: "ชำระเงิน", align: "left" },
  { key: "actions", label: "จัดการ", align: "right" },
] as const;

/**
 * Desktop-only table. Below `lg` the directory renders CustomerCard instead, so
 * this never has to squeeze seven columns into a phone.
 */
export function CustomerTable({
  customers,
  currentQueueNumber,
  activeLotId,
  lots,
}: {
  customers: Customer[];
  currentQueueNumber: number | null;
  /** Only the open lot has a "NOW" row. */
  activeLotId: string | undefined;
  lots: Lot[];
}) {
  return (
    <div className="overflow-hidden rounded-card border-[1.5px] border-line bg-surface">
      <table className="w-full border-collapse">
        <caption className="sr-only">
          รายชื่อลูกค้าทั้งหมดพร้อมสถานะงานและการชำระเงิน
        </caption>
        <thead>
          <tr className="bg-surface-header">
            {headings.map((heading) => (
              <th
                key={heading.key}
                scope="col"
                className={cn(
                  "px-2.5 py-3 font-mono text-[10.5px] font-medium text-subtle first:pl-4.5 last:pr-4.5",
                  heading.align === "right" ? "text-right" : "text-left",
                )}
              >
                {heading.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => {
            const cancelled = customer.state === "cancelled";
            const isCurrent =
              currentQueueNumber !== null &&
              customer.queueNumber === currentQueueNumber &&
              customer.lotId === activeLotId;
            const lot = lots.find((entry) => entry.id === customer.lotId);

            return (
              <tr
                key={customer.id}
                className={cn(
                  "border-t-[1.5px] border-[#F2EBE2]",
                  isCurrent && "bg-[#FBF8FF]",
                  cancelled && "opacity-62",
                )}
              >
                <td
                  className={cn(
                    "py-3 pr-2.5 pl-4.5 font-display text-[15px] font-bold",
                    cancelled ? "text-subtle line-through" : "text-ink",
                  )}
                >
                  {queueTag(customer.queueNumber)}
                </td>
                <td className="px-2.5 py-3 text-[13.5px] font-medium text-ink">
                  {customer.name}
                  {isCurrent ? (
                    <span className="ml-1.5 rounded-full bg-violet-bg px-1.5 py-0.5 font-mono text-[9.5px] font-medium text-violet">
                      NOW
                    </span>
                  ) : null}
                </td>
                <td className="px-2.5 py-3 font-mono text-xs font-medium text-body">
                  {customer.code}
                </td>
                <td className="px-2.5 py-3 font-mono text-xs font-medium text-body">
                  {String(lot?.number ?? 0).padStart(2, "0")}
                </td>
                <td className="px-2.5 py-3">
                  <StagePill customer={customer} />
                </td>
                <td className="px-2.5 py-3">
                  <PaymentPill customer={customer} />
                </td>
                <td className="py-3 pr-4.5 pl-2.5 text-right">
                  <Link
                    href={`/admin/customers/${customer.code}`}
                    className={cn(
                      "font-display text-[12.5px] font-semibold hover:underline",
                      cancelled ? "text-subtle" : "text-violet",
                    )}
                  >
                    {cancelled ? "ดู" : "แก้ไข"}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
