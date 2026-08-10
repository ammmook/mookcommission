import type { Quotation, QuotationLine } from "@/lib/types";

const DEFAULT_TERMS =
  "มัดจำ 50% ก่อนเริ่มลงสี · แก้ไขได้ 2 ครั้ง · ไฟล์ส่งภายใน 14 วันหลังชำระครบ";

export const quotations: Quotation[] = [
  {
    id: "qt-014",
    number: "QT-2569-014",
    customerId: "c-05",
    status: "issued",
    issuedLabel: "30 JUL 2026",
    lines: [
      { id: "l1", item: "Half Body Character", qty: 2, price: 900 },
      { id: "l2", item: "Simple Background", qty: 1, price: 400 },
      { id: "l3", item: "ไฟล์ PSD แยกเลเยอร์", qty: 1, price: 200 },
    ],
    discount: 0,
    terms:
      "ใบเสนอราคานี้ออกครั้งเดียวหลังร่างเสร็จ · มัดจำ 50% ก่อนเริ่มลงสี · ราคารวมแก้ไขได้ 2 ครั้ง",
  },
  {
    id: "qt-015",
    number: "QT-2569-015",
    customerId: "c-07",
    status: "draft",
    lines: [
      { id: "l1", item: "Full Body Character", qty: 1, price: 1500 },
      { id: "l2", item: "Detailed Background", qty: 1, price: 800 },
      { id: "l3", item: "Extra Prop", qty: 2, price: 250 },
    ],
    discount: 0,
    terms: DEFAULT_TERMS,
  },
  {
    id: "qt-016",
    number: "QT-2569-016",
    customerId: "c-06",
    status: "issued",
    issuedLabel: "3 AUG 2026",
    lines: [
      { id: "l1", item: "Half Body Character", qty: 1, price: 2000 },
      { id: "l2", item: "Simple Background", qty: 1, price: 400 },
    ],
    discount: 0,
    terms: DEFAULT_TERMS,
  },
];

export function getQuotation(id: string | null): Quotation | undefined {
  if (!id) return undefined;
  return quotations.find((q) => q.id === id);
}

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
