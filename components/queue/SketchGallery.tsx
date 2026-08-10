"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { Sketch } from "@/lib/types";

/**
 * Thumbnail grid; tapping a sketch opens it in a dialog. Two columns on phones,
 * four from `sm`, so thumbnails never shrink below a comfortable tap target.
 *
 * Images come from the public `sketches` bucket, so the URLs need no signing.
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
              {/* eslint-disable-next-line @next/next/no-img-element -- the
                  storage host comes from an env var, so next/image cannot be
                  given a static remotePattern here. */}
              <img
                src={sketch.url}
                alt={sketch.label}
                loading="lazy"
                className="aspect-3/4 w-full rounded-2xl border-[1.5px] border-line bg-surface-muted object-cover"
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
        {openSketch ? (
          // eslint-disable-next-line @next/next/no-img-element -- see above.
          <img
            src={openSketch.url}
            alt={openSketch.label}
            className="max-h-[70vh] w-full rounded-2xl bg-surface-muted object-contain"
          />
        ) : null}
      </Modal>
    </>
  );
}
