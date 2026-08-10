import type { SiteSettings } from "@/lib/types";

/**
 * Studio identity shared by client and server.
 *
 * Keep this module free of server-only imports: the logo, footer and quotation
 * document are client components, and pulling `next/headers` in through here
 * breaks the build. The loader lives in `lib/site-server.ts`.
 */

/** Only used before migration 003, or if the settings row is unreadable. */
export const FALLBACK_SITE: SiteSettings = {
  studioName: "Commission Studio",
  contactHandle: null,
};

/** First character of the studio name, for the square logo mark. */
export function siteMark(studioName: string): string {
  return studioName.trim().charAt(0) || "•";
}
