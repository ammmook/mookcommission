/**
 * `sketches` rows plus the files they point at in the `sketches` storage bucket.
 *
 * The invariant both functions protect: a row must never reference a file that
 * is not there. Upload therefore removes the file if the insert fails, and
 * delete removes the row before the file — leaving, at worst, an orphaned file
 * that nothing links to, rather than a gallery tile that 404s.
 */

import type { Db } from "./db";
import { unwrap, unwrapOne } from "./db";
import { SKETCH_BUCKET, mapSketch } from "./map";
import type { Sketch } from "@/lib/types";

const SKETCH_COLUMNS = "id, entry_id, storage_path, label, sort_order, created_at";

/** The bucket is public, so this needs no round trip and never expires. */
export function sketchUrl(db: Db, storagePath: string): string {
  return db.storage.from(SKETCH_BUCKET).getPublicUrl(storagePath).data.publicUrl;
}

export async function listSketches(db: Db, entryId: string): Promise<Sketch[]> {
  const rows = unwrap(
    await db
      .from("sketches")
      .select(SKETCH_COLUMNS)
      .eq("entry_id", entryId)
      .order("sort_order", { ascending: true }),
  );
  return rows.map((row) => mapSketch(row, sketchUrl(db, row.storage_path)));
}

/** One query for many entries, so the customer list does not fan out. */
export async function listSketchesByEntries(
  db: Db,
  entryIds: string[],
): Promise<Map<string, Sketch[]>> {
  const grouped = new Map<string, Sketch[]>();
  if (entryIds.length === 0) return grouped;

  const rows = unwrap(
    await db
      .from("sketches")
      .select(SKETCH_COLUMNS)
      .in("entry_id", entryIds)
      .order("sort_order", { ascending: true }),
  );

  for (const row of rows) {
    const list = grouped.get(row.entry_id) ?? [];
    list.push(mapSketch(row, sketchUrl(db, row.storage_path)));
    grouped.set(row.entry_id, list);
  }
  return grouped;
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 10 * 1024 * 1024;

/** Client-side gate; storage policy and RLS remain the real authority. */
export function validateSketchFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "รองรับเฉพาะไฟล์ PNG, JPG, WEBP หรือ GIF";
  }
  if (file.size > MAX_BYTES) {
    return "ไฟล์ใหญ่เกิน 10 MB";
  }
  return null;
}

function storagePathFor(entryId: string, file: File): string {
  const dot = file.name.lastIndexOf(".");
  const ext = dot > 0 ? file.name.slice(dot + 1).toLowerCase() : "png";
  // Per-entry folder + random name: no collisions, and re-uploading the same
  // filename never overwrites an existing sketch.
  return `${entryId}/${crypto.randomUUID()}.${ext}`;
}

export async function uploadSketch(
  db: Db,
  input: { entryId: string; file: File; label: string; sortOrder: number },
): Promise<Sketch> {
  const path = storagePathFor(input.entryId, input.file);

  const { error: uploadError } = await db.storage
    .from(SKETCH_BUCKET)
    .upload(path, input.file, {
      cacheControl: "3600",
      contentType: input.file.type,
      upsert: false,
    });
  if (uploadError) throw uploadError;

  try {
    const row = unwrapOne(
      await db
        .from("sketches")
        .insert({
          entry_id: input.entryId,
          storage_path: path,
          label: input.label,
          sort_order: input.sortOrder,
        })
        .select(SKETCH_COLUMNS)
        .single(),
    );
    return mapSketch(row, sketchUrl(db, row.storage_path));
  } catch (error) {
    // The row never landed, so the file has nothing pointing at it. Clean up.
    await db.storage
      .from(SKETCH_BUCKET)
      .remove([path])
      .catch(() => undefined);
    throw error;
  }
}

/**
 * Row first, then file. If the file removal fails the gallery is already
 * correct; a stray object in the bucket is the cheaper kind of inconsistency.
 */
export async function deleteSketch(db: Db, sketch: Sketch): Promise<void> {
  const { error } = await db.from("sketches").delete().eq("id", sketch.id);
  if (error) throw error;

  const { error: storageError } = await db.storage
    .from(SKETCH_BUCKET)
    .remove([sketch.storagePath]);
  if (storageError) {
    console.error("[torqueue] sketch file left in storage", storageError);
  }
}
