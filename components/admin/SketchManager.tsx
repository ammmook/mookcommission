"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { ArtPlaceholder } from "@/components/ui/ArtPlaceholder";
import { Button } from "@/components/ui/Button";
import { CardHeader } from "@/components/ui/Card";
import type { Sketch } from "@/lib/types";

/** Sketch grid with remove buttons and a mock upload tile. */
export function SketchManager({ initial }: { initial: Sketch[] }) {
  const [sketches, setSketches] = useState(initial);

  const addSketch = () =>
    setSketches((current) => [
      ...current,
      { id: `new-${Date.now()}`, label: `SKETCH ${current.length + 1}` },
    ]);

  const removeSketch = (id: string) =>
    setSketches((current) => current.filter((sketch) => sketch.id !== id));

  return (
    <>
      <CardHeader
        title="ภาพร่าง"
        hint={
          <span className="font-mono">{sketches.length}</span>
        }
        action={
          <Button variant="outline" size="sm" onClick={addSketch}>
            อัปโหลดภาพ
          </Button>
        }
      />

      <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
        {sketches.map((sketch) => (
          <li key={sketch.id} className="relative">
            <ArtPlaceholder
              dense
              dashed={false}
              label={sketch.label}
              className="aspect-3/4 rounded-xl"
            />
            <button
              type="button"
              onClick={() => removeSketch(sketch.id)}
              aria-label={`ลบภาพร่าง ${sketch.label}`}
              className="absolute top-1.5 right-1.5 grid size-7 cursor-pointer place-items-center rounded-full bg-ink/72 text-white transition-colors hover:bg-ink"
            >
              <X size={12} aria-hidden="true" />
            </button>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={addSketch}
            className="flex aspect-3/4 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-line-dashed bg-surface-muted text-[11px] font-medium text-[#9B8B76] transition-colors hover:border-coral hover:text-coral"
          >
            <Plus size={18} aria-hidden="true" />
            <span className="hidden sm:inline">ลากไฟล์มาวาง</span>
            <span className="sm:hidden">เพิ่ม</span>
          </button>
        </li>
      </ul>
    </>
  );
}
