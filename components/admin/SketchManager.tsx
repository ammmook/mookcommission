"use client";

import { Plus, X } from "lucide-react";
import { useRef, useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CardHeader } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { supabaseBrowser } from "@/lib/supabase/client";
import { reportError } from "@/lib/supabase/errors";
import {
  deleteSketch,
  uploadSketch,
  validateSketchFile,
} from "@/lib/supabase/sketches";
import { useAdminData } from "@/lib/store/admin-store";
import type { Customer, Sketch } from "@/lib/types";

/**
 * Sketch grid backed by the `sketches` bucket.
 *
 * Uploading writes the file first and the row second (with the file removed
 * again if the row fails), so the gallery never shows a tile whose image is
 * missing. See `lib/supabase/sketches.ts` for the ordering.
 */
export function SketchManager({ customer }: { customer: Customer }) {
  const { refresh } = useAdminData();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // No local copy: the store refetches after each upload or delete, so this is
  // always the current list.
  const sketches = customer.sketches;

  const pickFiles = () => inputRef.current?.click();

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    // Reset immediately so re-picking the same file still fires a change.
    event.target.value = "";
    if (files.length === 0) return;

    setError(null);
    setPending(true);
    const progress = toast.saving(
      files.length > 1 ? `กำลังอัปโหลด ${files.length} ภาพ…` : "กำลังอัปโหลดภาพ…",
    );

    const db = supabaseBrowser();
    let sortOrder = sketches.length;
    let uploaded = 0;
    let lastError: string | null = null;

    for (const file of files) {
      const invalid = validateSketchFile(file);
      if (invalid) {
        lastError = `${file.name}: ${invalid}`;
        setError(lastError);
        continue;
      }
      try {
        await uploadSketch(db, {
          entryId: customer.id,
          file,
          label: `SKETCH ${String(sortOrder + 1).padStart(2, "0")}`,
          sortOrder,
        });
        sortOrder += 1;
        uploaded += 1;
      } catch (uploadError) {
        lastError = reportError(uploadError, `อัปโหลด ${file.name} ไม่สำเร็จ`);
        setError(lastError);
      }
    }

    setPending(false);
    await refresh();

    // A partly successful batch reports the failure — that is the part the
    // artist has to act on.
    if (lastError) progress.error(lastError);
    else progress.success(`อัปโหลด ${uploaded} ภาพแล้ว`);
  };

  const removeSketch = async (sketch: Sketch) => {
    setError(null);
    setPending(true);
    const progress = toast.saving("กำลังลบภาพร่าง…");
    try {
      await deleteSketch(supabaseBrowser(), sketch);
      await refresh();
      progress.success("ลบภาพร่างแล้ว");
    } catch (deleteError) {
      const message = reportError(deleteError, "ลบภาพร่างไม่สำเร็จ");
      setError(message);
      progress.error(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <CardHeader
        title="ภาพร่าง"
        hint={<span className="font-mono">{sketches.length}</span>}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={pickFiles}
            disabled={pending}
          >
            {pending ? "กำลังอัปโหลด…" : "อัปโหลดภาพ"}
          </Button>
        }
      />

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        multiple
        hidden
        onChange={handleFiles}
      />

      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
        {sketches.map((sketch) => (
          <li key={sketch.id} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- the bucket
                host is user-configured, so next/image would need a build-time
                remotePattern this project cannot know. */}
            <img
              src={sketch.url}
              alt={sketch.label}
              loading="lazy"
              className="aspect-3/4 w-full rounded-xl border-[1.5px] border-line bg-surface-muted object-cover"
            />
            <button
              type="button"
              onClick={() => void removeSketch(sketch)}
              disabled={pending}
              aria-label={`ลบภาพร่าง ${sketch.label}`}
              className="absolute top-1.5 right-1.5 grid size-7 cursor-pointer place-items-center rounded-full bg-ink/72 text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-55"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={pickFiles}
            disabled={pending}
            className="flex aspect-3/4 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line-dashed bg-surface-muted text-[11px] font-medium text-[#9B8B76] transition-colors hover:border-coral hover:text-coral disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Plus size={18} aria-hidden="true" />
            <span className="hidden sm:inline">เลือกไฟล์ภาพ</span>
            <span className="sm:hidden">เพิ่ม</span>
          </button>
        </li>
      </ul>

      {error ? (
        <p
          role="alert"
          className="mt-3 text-[11.5px] font-medium text-coral-text"
        >
          {error}
        </p>
      ) : null}
    </>
  );
}
