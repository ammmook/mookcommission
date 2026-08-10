import type { CommissionSpec } from "@/lib/types";

interface Row {
  icon: string;
  iconBg: string;
  label: string;
  value: string;
  mono?: boolean;
  wide?: boolean;
}

export function CommissionDetails({ spec }: { spec: CommissionSpec }) {
  const rows: Row[] = [
    { icon: "🎨", iconBg: "bg-coral-tint", label: "ประเภทงาน", value: spec.type },
    {
      icon: "👤",
      iconBg: "bg-violet-bg",
      label: "จำนวนตัวละคร",
      value: `${spec.characters} ตัวละคร`,
    },
    {
      icon: "📐",
      iconBg: "bg-teal-bg",
      label: "ขนาดไฟล์",
      value: spec.dimensions,
      mono: true,
    },
    {
      icon: "📝",
      iconBg: "bg-amber-bg",
      label: "รายละเอียดเพิ่มเติม",
      value: spec.note,
      wide: true,
    },
  ];

  return (
    <dl className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-1">
      {rows.map((row) => (
        <div
          key={row.label}
          className={`flex items-start gap-3 ${row.wide ? "sm:col-span-2 lg:col-span-1" : ""}`}
        >
          <span
            aria-hidden="true"
            className={`grid size-9 shrink-0 place-items-center rounded-xl text-base ${row.iconBg}`}
          >
            {row.icon}
          </span>
          <div className="min-w-0">
            <dt className="text-[11px] text-subtle">{row.label}</dt>
            <dd
              className={
                row.wide
                  ? "text-[12.5px] leading-relaxed text-ink"
                  : `font-display text-sm font-semibold text-ink ${row.mono ? "font-mono" : ""}`
              }
            >
              {row.value}
            </dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
