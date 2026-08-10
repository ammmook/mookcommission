/**
 * `site_settings` — a single row, keyed by the literal `true`.
 *
 * Note the RLS policy is `to authenticated using (is_admin())`: an anonymous
 * visitor cannot read this table, and the three customer RPCs do not include
 * it. So the public header and footer keep their built-in wording, and these
 * functions are only ever called from admin screens.
 */

import type { Db } from "./db";
import { unwrap } from "./db";
import { mapSettings } from "./map";
import type { SiteSettingsRow } from "./database.types";
import type { SiteSettings } from "@/lib/types";

const SETTINGS_COLUMNS = "id, studio_name, contact_handle, updated_at";

export async function getSiteSettings(db: Db): Promise<SiteSettings | null> {
  const row = unwrap(
    await db.from("site_settings").select(SETTINGS_COLUMNS).maybeSingle(),
  ) as SiteSettingsRow | null;

  return row ? mapSettings(row) : null;
}

export async function updateSiteSettings(
  db: Db,
  patch: { studioName: string; contactHandle: string },
): Promise<SiteSettings> {
  const row = unwrap(
    await db
      .from("site_settings")
      .update({
        studio_name: patch.studioName.trim(),
        contact_handle: patch.contactHandle.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", true)
      .select(SETTINGS_COLUMNS)
      .single(),
  ) as SiteSettingsRow;

  return mapSettings(row);
}
