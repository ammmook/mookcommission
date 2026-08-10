import { baht } from "@/lib/format";
import type { Customer } from "@/lib/types";

/** Green "paid" panel / amber "awaiting payment" panel from mockup 1b. */
export function PaymentCard({ customer }: { customer: Customer }) {
  const paid = customer.payment === "paid";

  return (
    <section
      className={
        paid
          ? "rounded-card border-[1.5px] border-teal-border bg-teal-bg p-4 sm:p-5"
          : "rounded-card border-[1.5px] border-amber-border bg-amber-bg p-4 sm:p-5"
      }
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          aria-hidden="true"
          className={`size-2.5 shrink-0 rounded-full ${paid ? "bg-teal" : "bg-amber"}`}
        />
        <h2
          className={`text-[15px] font-semibold ${paid ? "text-teal-text" : "text-amber-text"}`}
        >
          {paid ? "ชำระเงินแล้ว" : "รอชำระเงิน"}
        </h2>
        <span
          className={`ml-auto font-mono text-[10px] font-medium ${paid ? "text-teal-mid" : "text-amber-text"}`}
        >
          {paid ? "PAID" : "UNPAID"}
        </span>
      </div>
      <p
        className={`mt-2 text-xs ${paid ? "text-teal-mid" : "text-amber-text"}`}
      >
        {customer.amount === null
          ? "ยังไม่มีการออกใบเสนอราคา"
          : paid
            ? `ยอด ${baht(customer.amount)} · ชำระเมื่อ ${customer.paidDateLabel}`
            : `ยอด ${baht(customer.amount)} · รอการชำระเงิน`}
      </p>
    </section>
  );
}
