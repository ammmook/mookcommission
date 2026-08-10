"use client";

import { lotLabel } from "@/data/lots";
import { lineTotal, subtotal } from "@/data/quotations";
import { amount, baht, queueTag } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Customer, Lot, Quotation } from "@/lib/types";
import { Logo } from "@/components/ui/Logo";
import { useSiteSettings } from "@/lib/store/site-settings";

/** File formats the finished work is delivered in. */
const DELIVERY_FORMATS = "PNG + JPEG";

interface QuotationDocumentProps {
  quotation: Quotation;
  customer: Customer;
  lot: Lot;
  /** "compact" is the live preview inside the admin builder. */
  variant?: "full" | "compact";
  className?: string;
}

/**
 * The printable quotation. Shared by the customer view (1d) and the admin live
 * preview (1i) so both always agree on totals and wording.
 */
export function QuotationDocument({
  quotation,
  customer,
  lot,
  variant = "full",
  className,
}: QuotationDocumentProps) {
  const { contactHandle } = useSiteSettings();
  const compact = variant === "compact";
  const lines = quotation.lines.filter((line) => line.item.trim() !== "");
  const sub = subtotal(lines);
  const total = sub - quotation.discount;
  const meta = `${customer.name} · ${customer.code} · Queue ${queueTag(customer.queueNumber)} · ${lotLabel(lot)}`;

  return (
    <article
      className={cn(
        "rounded-2xl bg-white shadow-[0_4px_18px_rgba(43,35,64,.08)]",
        compact ? "p-5 sm:p-6" : "p-5 sm:p-8 lg:px-9 lg:py-8.5",
        className,
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-ink pb-4">
        <div className="min-w-0">
          <Logo size={compact ? "sm" : "md"} />
          {!compact && contactHandle ? (
            <p className="mt-2 text-[11.5px] leading-relaxed text-subtle">
              commission by {contactHandle}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <h2
            className={cn(
              "font-bold text-ink",
              compact ? "text-[17px]" : "text-xl sm:text-2xl",
            )}
          >
            ใบเสนอราคา
          </h2>
          <p className="mt-0.5 font-mono text-[10px] font-medium text-subtle">
            {compact
              ? `${quotation.number} · ${quotation.status === "draft" ? "DRAFT" : "ISSUED"}`
              : `QUOTATION · ${quotation.number}`}
          </p>
          {!compact && quotation.issuedLabel ? (
            <span className="mt-2 inline-block rounded-full bg-teal-bg px-2.5 py-1 font-mono text-[10.5px] font-semibold text-teal-text">
              ISSUED · {quotation.issuedLabel}
            </span>
          ) : null}
        </div>
      </header>

      {compact ? (
        <div className="pt-3.5">
          <p className="text-[11.5px] text-subtle">ลูกค้า</p>
          <p className="mt-0.5 font-display text-sm font-semibold text-ink">
            {meta}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 border-b-[1.5px] border-line py-5 sm:grid-cols-2">
          <div>
            <p className="font-mono text-[10.5px] text-subtle">
              ลูกค้า / CUSTOMER
            </p>
            <p className="mt-1 font-display text-[15px] font-semibold text-ink">
              {customer.name}
            </p>
            <p className="mt-0.5 text-xs text-body">
              รหัสคิว {customer.code} · Queue {queueTag(customer.queueNumber)} ·{" "}
              {lotLabel(lot)}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10.5px] text-subtle">
              งาน / COMMISSION
            </p>
            <p className="mt-1 font-display text-[15px] font-semibold text-ink">
              {customer.commission.type} · {customer.commission.characters}{" "}
              ตัวละคร
            </p>
            <p className="mt-0.5 text-xs text-body">
              {customer.commission.dimensions} · {DELIVERY_FORMATS}
            </p>
          </div>
        </div>
      )}

      {!compact ? (
        <h3 className="pt-4 pb-2.5 text-sm font-semibold text-ink">รายการงาน</h3>
      ) : null}

      {/* Phones get a stacked list; the four-column table starts at sm. */}
      <ul className="mt-3 flex flex-col sm:hidden">
        {lines.map((line) => (
          <li
            key={line.id}
            className="flex items-baseline justify-between gap-3 border-t-[1.5px] border-line py-2.5"
          >
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-ink">
                {line.item}
              </span>
              <span className="font-mono text-[11px] text-body">
                ×{line.qty} · {amount(line.price)}
              </span>
            </span>
            <span className="shrink-0 font-mono text-[13px] font-semibold text-ink">
              {amount(lineTotal(line))}
            </span>
          </li>
        ))}
      </ul>

      <table className="hidden w-full border-collapse sm:table">
        <thead>
          <tr>
            <th
              scope="col"
              className="pb-2 text-left font-mono text-[10.5px] font-medium text-subtle"
            >
              ITEM
            </th>
            <th
              scope="col"
              className="pb-2 text-right font-mono text-[10.5px] font-medium text-subtle"
            >
              QTY
            </th>
            <th
              scope="col"
              className="pb-2 text-right font-mono text-[10.5px] font-medium text-subtle"
            >
              PRICE
            </th>
            <th
              scope="col"
              className="pb-2 text-right font-mono text-[10.5px] font-medium text-subtle"
            >
              AMOUNT
            </th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id}>
              <td className="border-t-[1.5px] border-line py-3 text-[13.5px] font-medium text-ink">
                {line.item}
              </td>
              <td className="border-t-[1.5px] border-line py-3 text-right font-mono text-[13px] font-medium text-body">
                {line.qty}
              </td>
              <td className="border-t-[1.5px] border-line py-3 text-right font-mono text-[13px] font-medium text-body">
                {amount(line.price)}
              </td>
              <td className="border-t-[1.5px] border-line py-3 text-right font-mono text-[13px] font-semibold text-ink">
                {amount(lineTotal(line))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <dl className="flex w-full flex-col gap-2 sm:w-62">
          <div className="flex justify-between">
            <dt className="text-[12.5px] text-body">Subtotal</dt>
            <dd className="font-mono text-[13px] font-medium text-ink">
              {baht(sub)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[12.5px] text-body">ส่วนลด</dt>
            <dd className="font-mono text-[13px] font-medium text-body">
              {quotation.discount > 0 ? `−${baht(quotation.discount)}` : "–"}
            </dd>
          </div>
          <div className="mt-1 flex items-baseline justify-between gap-3 rounded-xl bg-ink px-4 py-3">
            <dt className="font-display text-[13px] font-semibold text-white">
              รวมทั้งสิ้น
            </dt>
            <dd className="font-display text-xl font-bold text-amber">
              {baht(total)}
            </dd>
          </div>
        </dl>
      </div>

      <p
        className={cn(
          "text-[11px] leading-relaxed text-subtle",
          compact
            ? "mt-3.5"
            : "mt-5 border-t-[1.5px] border-line pt-3.5 text-[11.5px]",
        )}
      >
        {quotation.terms}
      </p>
    </article>
  );
}
