"use client";

import Link from "next/link";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useState } from "react";
import { AdminActionError, AdminLoadError, AdminScreenSkeleton } from "./AdminStatus";
import { StickyActionBar } from "@/components/layout/StickyActionBar";
import { QuotationDocument } from "@/components/quotation/QuotationDocument";
import { Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input, Textarea } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { DEFAULT_TERMS, emptyLine, subtotal } from "@/data/quotations";
import { baht, queueTag } from "@/lib/format";
import { supabaseBrowser } from "@/lib/supabase/client";
import { reportError } from "@/lib/supabase/errors";
import { issueQuotation, saveQuotationDraft } from "@/lib/supabase/quotations";
import { useAdminData } from "@/lib/store/admin-store";
import type { Quotation, QuotationLine } from "@/lib/types";

/** Placeholder document number until the database assigns the real one. */
const PENDING_DOC_NUMBER = "QT-…";

/**
 * Line-item editor with a live preview. Desktop shows both side by side; below
 * `lg` they become tabs so neither pane gets squeezed.
 *
 * `quotation_items.amount` is a generated column, so only `qty` and
 * `unit_price` are ever sent — the totals shown here are a preview of what the
 * database will compute, not the source of it.
 */
export function QuotationBuilder({ code }: { code: string }) {
  const { getCustomer, lots, refresh, loading, loadError } = useAdminData();
  const customer = getCustomer(code);
  const existing = customer?.quotation ?? null;

  const [lines, setLines] = useState<QuotationLine[]>(
    existing?.lines.length ? existing.lines : [emptyLine("l1")],
  );
  const [terms, setTerms] = useState(existing?.terms || DEFAULT_TERMS);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [issued, setIssued] = useState(existing?.status === "issued");
  const [docNumber, setDocNumber] = useState(
    existing?.number ?? PENDING_DOC_NUMBER,
  );
  const [issuedLabel, setIssuedLabel] = useState(existing?.issuedLabel);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);

  const lot = lots.find((entry) => entry.id === customer?.lotId);

  if (loading) return <AdminScreenSkeleton />;
  if (loadError) return <AdminLoadError message={loadError} />;

  if (!customer || !lot) {
    return (
      <EmptyState
        className="mx-auto max-w-md"
        dashed
        title="ไม่พบลูกค้ารายนี้แล้ว"
        description="ลูกค้าอาจถูกลบออกจากระบบไปแล้ว ลองกลับไปที่รายชื่อลูกค้า"
        action={
          <LinkButton href="/admin/customers" size="lg" fullWidth>
            กลับรายชื่อลูกค้า
          </LinkButton>
        }
      />
    );
  }

  const updateLine = (id: string, patch: Partial<QuotationLine>) =>
    setLines((current) =>
      current.map((line) => (line.id === id ? { ...line, ...patch } : line)),
    );

  const addLine = () =>
    setLines((current) => [...current, emptyLine(`new-${Date.now()}`)]);

  const removeLine = (id: string) =>
    setLines((current) => current.filter((line) => line.id !== id));

  const discount = existing?.discount ?? 0;
  const total = subtotal(lines) - discount;
  const locked = issued;

  /** Shared by "บันทึกร่าง" and "ออกใบ": both persist the same payload. */
  const persist = async (mode: "draft" | "issue") => {
    if (pending) return;
    setPending(true);
    setError(null);
    setSavedNote(null);

    try {
      const input = {
        entryId: customer.id,
        lines,
        terms,
        discount,
      };
      const saved =
        mode === "issue"
          ? await issueQuotation(supabaseBrowser(), input)
          : await saveQuotationDraft(supabaseBrowser(), input);

      setDocNumber(saved.number);
      setLines(saved.lines.length ? saved.lines : [emptyLine("l1")]);
      setTerms(saved.terms);
      setIssuedLabel(saved.issuedLabel);
      setIssued(saved.status === "issued");
      setSavedNote(
        mode === "issue" ? "ออกใบเสนอราคาแล้ว" : "บันทึกฉบับร่างแล้ว",
      );
      await refresh();
    } catch (saveError) {
      setError(
        reportError(
          saveError,
          mode === "issue" ? "ออกใบไม่สำเร็จ" : "บันทึกร่างไม่สำเร็จ",
        ),
      );
    } finally {
      setPending(false);
    }
  };

  const previewQuotation: Quotation = {
    id: existing?.id ?? "preview",
    number: docNumber,
    customerId: customer.id,
    status: issued ? "issued" : "draft",
    issuedLabel,
    lines,
    discount,
    terms,
  };

  return (
    <>
      <header className="mb-4 flex flex-wrap items-center gap-x-3.5 gap-y-2.5">
        <Link
          href={`/admin/customers/${customer.code}`}
          className="hidden items-center gap-1.5 text-[12.5px] font-medium text-body transition-colors hover:text-ink md:inline-flex"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          {queueTag(customer.queueNumber)} {customer.name}
        </Link>
        <h1 className="text-lg font-bold text-ink">
          {locked ? "ใบเสนอราคา" : "สร้างใบเสนอราคา"}
        </h1>
        <Badge
          mono
          toneClass={
            locked ? "bg-teal-bg text-teal-text" : "bg-amber-bg text-amber-text"
          }
        >
          {locked ? "ISSUED · ล็อกแล้ว" : "DRAFT · แก้ไขได้"}
        </Badge>

        <div className="ml-auto hidden gap-2.5 md:flex">
          <Button
            variant="outline"
            disabled={locked || pending}
            onClick={() => void persist("draft")}
          >
            {pending ? "กำลังบันทึก…" : "บันทึกร่าง"}
          </Button>
          <Button
            disabled={locked || pending}
            onClick={() => void persist("issue")}
          >
            ออกใบ &amp; ส่งให้ลูกค้า
          </Button>
        </div>
      </header>

      <AdminActionError message={error} />
      {savedNote ? (
        <p
          role="status"
          className="mt-3 rounded-2xl border-[1.5px] border-teal-border bg-teal-bg px-4 py-3 text-[11.5px] font-medium text-teal-text"
        >
          {savedNote}
        </p>
      ) : null}

      {/* Tab switch replaces the split view below lg. */}
      <SegmentedControl
        stretch
        label="สลับมุมมองแก้ไขและพรีวิว"
        segments={[
          { value: "edit", label: "แก้ไข" },
          { value: "preview", label: "พรีวิว" },
        ]}
        value={tab}
        onChange={(value) => setTab(value as "edit" | "preview")}
        className="mb-4 lg:hidden"
      />

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <form
          onSubmit={(event) => event.preventDefault()}
          className={tab === "edit" ? "min-w-0" : "hidden min-w-0 lg:block"}
        >
          <h2 className="mb-3.5 text-[15px] font-semibold text-ink">รายการงาน</h2>

          <ul className="flex flex-col gap-2.5">
            {lines.map((line, index) => (
              <li
                key={line.id}
                className="rounded-2xl border-[1.5px] border-line bg-surface p-3.5 sm:flex sm:items-end sm:gap-2.5 sm:border-0 sm:bg-transparent sm:p-0"
              >
                <p className="mb-2 font-display text-xs font-semibold text-ink sm:hidden">
                  รายการที่ {index + 1}
                </p>

                <span className="mb-2 block min-w-0 sm:mb-0 sm:flex-1">
                  <label htmlFor={`item-${line.id}`} className="sr-only">
                    ชื่อรายการที่ {index + 1}
                  </label>
                  <Input
                    id={`item-${line.id}`}
                    value={line.item}
                    disabled={locked}
                    placeholder="ชื่อรายการ"
                    onChange={(event) =>
                      updateLine(line.id, { item: event.target.value })
                    }
                  />
                </span>

                <span className="flex gap-2.5">
                  <span className="min-w-0 flex-1 sm:w-18 sm:flex-none">
                    <label htmlFor={`qty-${line.id}`} className="sr-only">
                      จำนวนของรายการที่ {index + 1}
                    </label>
                    <Input
                      id={`qty-${line.id}`}
                      type="number"
                      min={1}
                      mono
                      disabled={locked}
                      value={line.qty}
                      onChange={(event) =>
                        updateLine(line.id, {
                          qty: Math.max(1, Number(event.target.value) || 1),
                        })
                      }
                      className="text-right"
                    />
                  </span>
                  <span className="min-w-0 flex-[1.4] sm:w-26 sm:flex-none">
                    <label htmlFor={`price-${line.id}`} className="sr-only">
                      ราคาของรายการที่ {index + 1}
                    </label>
                    <Input
                      id={`price-${line.id}`}
                      type="number"
                      min={0}
                      mono
                      disabled={locked}
                      value={line.price}
                      onChange={(event) =>
                        updateLine(line.id, {
                          price: Math.max(0, Number(event.target.value) || 0),
                        })
                      }
                      className="text-right"
                    />
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLine(line.id)}
                    disabled={locked}
                    aria-label={`ลบรายการที่ ${index + 1}`}
                    className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl border-[1.5px] border-line bg-white text-coral-text transition-colors hover:border-coral-border hover:bg-coral-bg disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                </span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={addLine}
            disabled={locked}
            className="mt-3 flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line-dashed bg-surface-muted font-display text-[13px] font-semibold text-body transition-colors hover:border-coral hover:text-coral disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Plus size={16} aria-hidden="true" />
            เพิ่มรายการ
          </button>

          <h2 className="mt-6 mb-3 text-[15px] font-semibold text-ink">เงื่อนไข</h2>
          <label htmlFor="quotation-terms" className="sr-only">
            เงื่อนไขใบเสนอราคา
          </label>
          <Textarea
            id="quotation-terms"
            rows={3}
            value={terms}
            disabled={locked}
            onChange={(event) => setTerms(event.target.value)}
          />

          <p className="mt-4 flex items-start gap-2.5 rounded-2xl border-[1.5px] border-amber-border bg-amber-bg px-4 py-3 text-xs leading-relaxed text-amber-text">
            <span aria-hidden="true">🔒</span>
            ออกใบได้ครั้งเดียวหลังร่างเสร็จ — หลังกด “ออกใบ &amp; ส่ง”
            จะแก้ไขไม่ได้อีก
          </p>

          {/* Running total, so the number is visible without leaving the form. */}
          <div className="mt-4 flex items-baseline justify-between rounded-2xl bg-ink px-4.5 py-3.5 lg:hidden">
            <span className="font-display text-sm font-semibold text-white">
              รวมทั้งสิ้น
            </span>
            <span className="font-display text-xl font-bold text-amber">
              {baht(total)}
            </span>
          </div>
        </form>

        <section
          className={`min-w-0 lg:block ${tab === "preview" ? "" : "hidden"}`}
        >
          <h2 className="mb-3.5 text-[15px] font-semibold text-ink">
            พรีวิวสด{" "}
            <span className="font-sans text-[11px] font-normal text-subtle">
              / Live preview
            </span>
          </h2>
          <div className="rounded-3xl bg-canvas p-3.5 sm:p-5">
            <QuotationDocument
              quotation={previewQuotation}
              customer={customer}
              lot={lot}
              variant="compact"
            />
          </div>
        </section>
      </div>

      <StickyActionBar>
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={locked || pending}
          onClick={() => void persist("draft")}
        >
          บันทึกร่าง
        </Button>
        <Button
          size="lg"
          className="flex-[1.4]"
          disabled={locked || pending}
          onClick={() => void persist("issue")}
        >
          ออกใบ &amp; ส่ง
        </Button>
      </StickyActionBar>
    </>
  );
}
