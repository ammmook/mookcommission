import { queuesAheadLabel } from "@/data/customers";
import { lotLabel } from "@/data/lots";
import { queueTag } from "@/lib/format";
import type { Customer, Lot } from "@/lib/types";
import { QueueDots } from "./QueueDots";

interface QueueHeroProps {
  customer: Customer;
  lot: Lot;
  /**
   * Active, unfinished queues ahead of this one — straight from the
   * `queue_public` view, so cancelled and completed work is already excluded.
   */
  queuesAhead: number;
  /** Completed queues in the lot, from `lot_progress.done_count`. */
  doneCount: number;
}

/**
 * The headline card on the customer queue page. It has three looks — running,
 * paused and cancelled — matching options 1b and 1c of the mockups.
 */
export function QueueHero({
  customer,
  lot,
  queuesAhead,
  doneCount,
}: QueueHeroProps) {
  if (customer.state === "cancelled") return <CancelledHero customer={customer} />;
  if (customer.state === "paused") return <PausedHero customer={customer} />;

  const ahead = queuesAheadLabel(queuesAhead);
  const done = doneCount;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-linear-135 from-ink to-ink-soft p-6 text-white sm:p-7 lg:px-7.5 lg:py-8">
      <span
        aria-hidden="true"
        className="absolute -top-10 -right-10 size-45 rounded-full bg-amber/16"
      />
      <div className="relative">
        <p className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-teal animate-pulse-ring sm:size-2.5"
          />
          <span className="text-[11.5px] font-semibold text-[#9EE8D6] sm:text-[12.5px]">
            กำลังทำงานอยู่{" "}
            <span className="font-normal">/ Working normally</span>
          </span>
        </p>

        <h1 className="mt-2 text-[clamp(2.25rem,9vw,3.25rem)] leading-none font-bold">
          Queue {queueTag(customer.queueNumber)}
        </h1>

        <p className="mt-1.5 mb-5 text-sm font-medium text-[#FFD9A0] sm:text-base">
          {ahead.th}{" "}
          <span className="text-[12.5px] font-normal text-nav-text">
            / {ahead.en}
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <QueueDots
            capacity={lot.capacity}
            done={done}
            current={customer.queueNumber - queuesAhead}
          />
          <span className="ml-auto font-mono text-[11px] font-medium text-nav-text">
            {lotLabel(lot).toUpperCase()} · {done}/{lot.capacity} DONE
          </span>
        </div>
      </div>
    </section>
  );
}

function PausedHero({ customer }: { customer: Customer }) {
  return (
    <section className="rounded-3xl bg-linear-135 from-[#5A4326] to-[#8A6023] p-6 text-white sm:p-7">
      <span className="inline-flex items-center gap-2 rounded-full bg-white/16 px-3 py-1.5">
        <span aria-hidden="true">⏸</span>
        <span className="font-mono text-[11px] font-bold tracking-wider">
          PAUSED
        </span>
      </span>
      <h1 className="mt-3 text-[clamp(2rem,8vw,2.5rem)] leading-none font-bold">
        Queue {queueTag(customer.queueNumber)}
      </h1>
      <p className="mt-1 text-sm font-medium text-[#FFE0AE]">คิวนี้หยุดชั่วคราว</p>
      <p className="mt-3.5 max-w-prose text-[12.5px] leading-relaxed text-white/80">
        ศิลปินพักงานชั่วคราว คิวของคุณจะไม่ถูกข้าม
        และจะกลับมาดำเนินการต่อจากขั้นตอนเดิม
      </p>
    </section>
  );
}

function CancelledHero({ customer }: { customer: Customer }) {
  return (
    <section className="rounded-3xl border-[1.5px] border-stone-border bg-stone-bg p-6 sm:p-7">
      <span className="inline-flex items-center gap-2 rounded-full bg-stone-border px-3 py-1.5">
        <span aria-hidden="true" className="size-2.5 rounded-full bg-[#7A7268]" />
        <span className="font-mono text-[11px] font-bold tracking-wider text-[#5C554D]">
          CANCELLED
        </span>
      </span>
      <h1 className="mt-3 text-[clamp(1.75rem,7vw,2.125rem)] leading-tight font-bold text-[#6E6659] line-through decoration-2">
        Queue {queueTag(customer.queueNumber)}
      </h1>
      <p className="mt-1 text-sm font-medium text-[#6E6659]">
        ยกเลิกแล้ว / Cancelled
      </p>
      <p className="mt-3 max-w-prose text-[12.5px] leading-relaxed text-[#8A8377]">
        คิวนี้ถูกยกเลิก เลขคิวยังคงอยู่ในระบบแต่ไม่ได้อยู่ระหว่างดำเนินการ
      </p>
    </section>
  );
}
