import type { QuotationLine } from "@/lib/types";

/**
 * Quotation arithmetic and defaults.
 *
 * The mock quotations are gone; real ones come from `lib/supabase/quotations.ts`.
 * These helpers stay because the builder, the printable document and the live
 * preview all have to agree on the same totals.
 *
 * Note the database computes `quotation_items.amount` as a generated column.
 * `lineTotal` mirrors that formula for the *preview* only — nothing here is
 * ever written back.
 */

export const DEFAULT_TERMS =
  "💗 หมายเหตุ: งานลงสีจะเริ่มหลังจากชำระเงินเรียบร้อยแล้วนะคะ ชำระเสร็จแล้วสามารถส่งสลิปแจ้งทาง Messenger ได้เลยค่ะ ✨";

export function lineTotal(line: QuotationLine): number {
  return line.qty * line.price;
}

export function subtotal(lines: QuotationLine[]): number {
  return lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

/** A blank line for the "+ เพิ่มรายการ" button in the builder. */
export function emptyLine(id: string): QuotationLine {
  return { id, item: "", qty: 1, price: 0 };
}
