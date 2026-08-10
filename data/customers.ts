import type { Customer, Sketch, Stage } from "@/lib/types";

const sketchSet = (labels: string[]): Sketch[] =>
  labels.map((label, i) => ({ id: `s${i + 1}`, label }));

/**
 * Featured customers from the mockups (Lot 03) plus archived rows from earlier
 * lots so the Lot filter and search have something to chew on.
 */
export const customers: Customer[] = [
  {
    id: "c-05",
    code: "MK001",
    name: "Mook",
    queueNumber: 5,
    lotId: "lot-03",
    stage: "coloring",
    state: "active",
    payment: "paid",
    amount: 2400,
    paidDateLabel: "30 ก.ค. 2569",
    commission: {
      type: "Half Body",
      characters: 2,
      dimensions: "3000 × 4000 px",
      note: "โทนสีอุ่น พื้นหลังเรียบ ส่งไฟล์ PNG + PSD",
    },
    sketches: sketchSet(["SKETCH 01", "SKETCH 02", "LINEART", "WIP COLOR"]),
    stageHistory: [
      { stage: "waiting", dateLabel: "12 ก.ค." },
      { stage: "sketch", dateLabel: "28 ก.ค." },
      { stage: "payment", dateLabel: "30 ก.ค." },
    ],
    history: [
      {
        id: "h1",
        label: "เปลี่ยนเป็น “กำลังลงสี”",
        dateLabel: "1 AUG",
        tone: "violet",
      },
      {
        id: "h2",
        label: "รับชำระเงิน ฿2,400",
        dateLabel: "30 JUL",
        tone: "teal",
      },
      { id: "h3", label: "ออกใบเสนอราคา", dateLabel: "30 JUL", tone: "amber" },
    ],
    quotationId: "qt-014",
    updatedLabel: "6 ส.ค. 2569",
  },
  {
    id: "c-04",
    code: "PL004",
    name: "Ploy",
    queueNumber: 4,
    lotId: "lot-03",
    stage: "coloring",
    state: "paused",
    payment: "paid",
    amount: 1800,
    paidDateLabel: "22 ก.ค. 2569",
    commission: {
      type: "Bust",
      characters: 1,
      dimensions: "2500 × 3000 px",
      note: "พื้นหลังโปร่งใส ส่งไฟล์ PNG",
    },
    sketches: sketchSet(["SKETCH 01", "LINEART"]),
    stageHistory: [
      { stage: "waiting", dateLabel: "8 ก.ค." },
      { stage: "sketch", dateLabel: "18 ก.ค." },
      { stage: "payment", dateLabel: "22 ก.ค." },
    ],
    history: [
      { id: "h1", label: "หยุดคิวชั่วคราว", dateLabel: "2 AUG", tone: "amber" },
      {
        id: "h2",
        label: "รับชำระเงิน ฿1,800",
        dateLabel: "22 JUL",
        tone: "teal",
      },
    ],
    quotationId: null,
    pausedNote: "หยุดตั้งแต่ 2 ส.ค. 2569 · คาดว่ากลับมา 12 ส.ค.",
    updatedLabel: "2 ส.ค. 2569",
  },
  {
    id: "c-06",
    code: "NM006",
    name: "Nammon",
    queueNumber: 6,
    lotId: "lot-03",
    stage: "payment",
    state: "active",
    payment: "unpaid",
    amount: 2400,
    commission: {
      type: "Half Body",
      characters: 1,
      dimensions: "3000 × 4000 px",
      note: "ตัวละครออริจินอล อ้างอิงตามภาพที่ส่ง",
    },
    sketches: sketchSet(["SKETCH 01", "SKETCH 02", "LINEART"]),
    stageHistory: [
      { stage: "waiting", dateLabel: "15 ก.ค." },
      { stage: "sketch", dateLabel: "1 ส.ค." },
    ],
    history: [
      { id: "h1", label: "ออกใบเสนอราคา", dateLabel: "3 AUG", tone: "amber" },
      { id: "h2", label: "ร่างภาพเสร็จ", dateLabel: "1 AUG", tone: "violet" },
    ],
    quotationId: "qt-016",
    updatedLabel: "3 ส.ค. 2569",
  },
  {
    id: "c-07",
    code: "BR007",
    name: "Bright",
    queueNumber: 7,
    lotId: "lot-03",
    stage: "sketch",
    state: "active",
    payment: "unpaid",
    amount: null,
    commission: {
      type: "Full Body",
      characters: 1,
      dimensions: "3500 × 5000 px",
      note: "พื้นหลังละเอียด มีพร็อพ 2 ชิ้น",
    },
    sketches: sketchSet(["SKETCH 01"]),
    stageHistory: [{ stage: "waiting", dateLabel: "20 ก.ค." }],
    history: [
      { id: "h1", label: "ร่างภาพเสร็จ", dateLabel: "5 AUG", tone: "violet" },
    ],
    quotationId: "qt-015",
    updatedLabel: "5 ส.ค. 2569",
  },
  {
    id: "c-08",
    code: "FA008",
    name: "Fai",
    queueNumber: 8,
    lotId: "lot-03",
    stage: "waiting",
    state: "active",
    payment: "unpaid",
    amount: null,
    commission: {
      type: "Bust",
      characters: 1,
      dimensions: "2000 × 2000 px",
      note: "ไอคอนโปรไฟล์ ทรงกลม",
    },
    sketches: [],
    stageHistory: [],
    history: [
      { id: "h1", label: "เพิ่มเข้าคิว", dateLabel: "28 JUL", tone: "amber" },
    ],
    quotationId: null,
    updatedLabel: "28 ก.ค. 2569",
  },
  {
    id: "c-09",
    code: "IC009",
    name: "Ice",
    queueNumber: 9,
    lotId: "lot-03",
    stage: "waiting",
    state: "cancelled",
    payment: "unpaid",
    amount: null,
    commission: {
      type: "Half Body",
      characters: 1,
      dimensions: "3000 × 4000 px",
      note: "—",
    },
    sketches: [],
    stageHistory: [],
    history: [
      { id: "h1", label: "ยกเลิกงาน", dateLabel: "4 AUG", tone: "coral" },
    ],
    quotationId: null,
    updatedLabel: "4 ส.ค. 2569",
  },
  {
    id: "c-03",
    code: "GT003",
    name: "Guitar",
    queueNumber: 3,
    lotId: "lot-03",
    stage: "completed",
    state: "active",
    payment: "paid",
    amount: 3200,
    paidDateLabel: "18 ก.ค. 2569",
    commission: {
      type: "Full Body",
      characters: 2,
      dimensions: "4000 × 5000 px",
      note: "ส่งไฟล์ PNG + PSD แยกเลเยอร์",
    },
    sketches: sketchSet(["SKETCH 01", "LINEART", "FINAL"]),
    stageHistory: [
      { stage: "waiting", dateLabel: "2 ก.ค." },
      { stage: "sketch", dateLabel: "10 ก.ค." },
      { stage: "payment", dateLabel: "18 ก.ค." },
      { stage: "coloring", dateLabel: "24 ก.ค." },
      { stage: "completed", dateLabel: "31 ก.ค." },
    ],
    history: [
      { id: "h1", label: "ส่งงานเรียบร้อย", dateLabel: "31 JUL", tone: "teal" },
    ],
    quotationId: null,
    updatedLabel: "31 ก.ค. 2569",
  },
  ...archivedCustomers(),
];

/**
 * Closed-lot rows. They are all delivered work, so they share a shape; keeping
 * them generated avoids 11 near-identical literals.
 */
function archivedCustomers(): Customer[] {
  const rows: Array<[string, string, number, string, Stage]> = [
    ["Jan", "JN201", 1, "lot-02", "completed"],
    ["Prim", "PM202", 2, "lot-02", "completed"],
    ["Tar", "TR203", 3, "lot-02", "completed"],
    ["Namcha", "NC204", 4, "lot-02", "completed"],
    ["Bank", "BK205", 5, "lot-02", "completed"],
    ["Aim", "AM206", 6, "lot-02", "completed"],
    ["Poom", "PO207", 7, "lot-02", "completed"],
    ["Win", "WN208", 8, "lot-02", "completed"],
    ["Tonkla", "TK101", 1, "lot-01", "completed"],
    ["Mild", "ML102", 2, "lot-01", "completed"],
    ["Earth", "ER103", 3, "lot-01", "completed"],
    ["Ploy P.", "PP104", 4, "lot-01", "completed"],
    ["Gun", "GN105", 5, "lot-01", "completed"],
    ["Nine", "NN106", 6, "lot-01", "completed"],
    ["Pream", "PR107", 7, "lot-01", "completed"],
    ["Title", "TT108", 8, "lot-01", "completed"],
    ["Bas", "BS109", 9, "lot-01", "completed"],
    ["View", "VW110", 10, "lot-01", "completed"],
  ];

  return rows.map(([name, code, queueNumber, lotId, stage]) => ({
    id: `c-${code.toLowerCase()}`,
    code,
    name,
    queueNumber,
    lotId,
    stage,
    state: "active" as const,
    payment: "paid" as const,
    amount: 1800,
    paidDateLabel: lotId === "lot-02" ? "20 ก.ค. 2569" : "25 มิ.ย. 2569",
    commission: {
      type: "Half Body",
      characters: 1,
      dimensions: "3000 × 4000 px",
      note: "ส่งงานเรียบร้อยแล้ว",
    },
    sketches: sketchSet(["SKETCH 01", "FINAL"]),
    stageHistory: [],
    history: [],
    quotationId: null,
    updatedLabel: lotId === "lot-02" ? "28 ก.ค. 2569" : "2 ก.ค. 2569",
  }));
}

/** Queue number the artist is working on right now, within the active lot. */
export const currentQueueNumber = 5;

export function getCustomerByCode(code: string): Customer | undefined {
  const normalised = code.trim().toUpperCase();
  return customers.find((c) => c.code === normalised);
}

export function getCustomerByQueueNumber(
  queueNumber: number,
  lotId = "lot-03",
): Customer | undefined {
  return customers.find(
    (c) => c.queueNumber === queueNumber && c.lotId === lotId,
  );
}

/** Landing-page lookup accepts either a queue code or a customer name. */
export function findCustomer(query: string): Customer | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return (
    customers.find((c) => c.code.toLowerCase() === q) ??
    customers.find((c) => c.name.toLowerCase() === q)
  );
}

/** How many active queues sit between the current queue and this one. */
export function queuesAhead(customer: Customer): number {
  if (customer.lotId !== "lot-03") return 0;
  return Math.max(0, customer.queueNumber - currentQueueNumber);
}

/**
 * Headline under the queue number. The mockup shows "เหลืออีก 3 คิว"; we derive
 * the count so it stays truthful when the queue advances, and swap in a
 * "your turn" message once nothing is ahead.
 */
export function queuesAheadLabel(customer: Customer): {
  th: string;
  en: string;
} {
  const ahead = queuesAhead(customer);
  if (ahead === 0) {
    return { th: "ถึงคิวของคุณแล้ว", en: "it's your turn" };
  }
  return { th: `เหลืออีก ${ahead} คิว`, en: `${ahead} queues ahead of you` };
}
