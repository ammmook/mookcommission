"use client";

import { useState } from "react";
import { ArtPlaceholder } from "@/components/ui/ArtPlaceholder";
import { Modal } from "@/components/ui/Modal";
import type { Sketch } from "@/lib/types";

/**
 * Thumbnail grid; tapping a sketch opens it in a dialog. Two columns on phones,
 * four from `sm`, so thumbnails never shrink below a comfortable tap target.
 */
export function SketchGallery({ sketches }: { sketches: Sketch[] }) {
  const [openSketch, setOpenSketch] = useState<Sketch | null>(null);

  return (
    <>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {sketches.map((sketch) => (
          <li key={sketch.id}>
            <button
              type="button"
              onClick={() => setOpenSketch(sketch)}
              className="w-full cursor-pointer rounded-2xl transition-transform hover:scale-[1.03]"
            >
              <ArtPlaceholder
                dense
                dashed={false}
                label={sketch.label}
                className="aspect-3/4 rounded-2xl"
              />
              <span className="sr-only">ดูภาพ {sketch.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <Modal
        open={openSketch !== null}
        onClose={() => setOpenSketch(null)}
        title={openSketch?.label ?? ""}
      >
        <ArtPlaceholder
          dense
          dashed={false}
          label={openSketch?.label}
          className="aspect-3/4 w-full rounded-2xl"
        />
      </Modal>
    </>
  );
}
