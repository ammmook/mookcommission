const bahtFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

/** "฿2,400" */
export function baht(amount: number): string {
  return `฿${bahtFormatter.format(amount)}`;
}

/** "2,400" — used inside quotation tables where the ฿ sits in the header. */
export function amount(value: number): string {
  return bahtFormatter.format(value);
}

/** "#05" — queue numbers are always two digits in this product. */
export function queueTag(queueNumber: number): string {
  return `#${String(queueNumber).padStart(2, "0")}`;
}

const thaiDateFormatter = new Intl.DateTimeFormat("th-TH-u-ca-buddhist", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * "6 ส.ค. 2569" — Buddhist-era, matching the dates baked into the mock data.
 * Call this from event handlers only; using `new Date()` during render would
 * desync the server and client markup.
 */
export function thaiDate(date: Date = new Date()): string {
  return thaiDateFormatter.format(date);
}

/** Clamped 0–100 percentage for progress bars. */
export function percent(value: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((value / total) * 100)));
}
