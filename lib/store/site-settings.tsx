"use client";

import { createContext, useContext, type ReactNode } from "react";
import { FALLBACK_SITE } from "@/lib/site";
import type { SiteSettings } from "@/lib/types";

/**
 * Makes the studio name and contact handle available to the client components
 * that render the brand — the header logo, the footer and the quotation
 * document — without each of them doing its own query.
 *
 * The root layout resolves the values on the server and passes them in, so
 * there is no loading state and no flash of the fallback name.
 */
const SiteSettingsContext = createContext<SiteSettings>(FALLBACK_SITE);

export function SiteSettingsProvider({
  value,
  children,
}: {
  value: SiteSettings;
  children: ReactNode;
}) {
  return (
    <SiteSettingsContext value={value}>{children}</SiteSettingsContext>
  );
}

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}
