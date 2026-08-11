import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Thai, JetBrains_Mono, Kanit } from "next/font/google";
import { loadSiteSettings } from "@/lib/site-server";
import { SiteSettingsProvider } from "@/lib/store/site-settings";
import "./globals.css";

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const plexThai = IBM_Plex_Sans_Thai({
  variable: "--font-plex-thai",
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500", "700"],
  display: "swap",
});

/** Title follows `site_settings.studio_name`, so renaming the studio renames the tab. */
export async function generateMetadata(): Promise<Metadata> {
  const { studioName } = await loadSiteSettings();
  return {
    title: { default: studioName, template: `%s · ${studioName}` },
    description:
      "ระบบค้นหาคิว @ammmook — ใส่รหัสที่ได้จากนักวาด",
  };
}

export const viewport: Viewport = {
  themeColor: "#FFF8F0",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const site = await loadSiteSettings();

  return (
    <html
      lang="th"
      className={`${kanit.variable} ${plexThai.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <SiteSettingsProvider value={site}>{children}</SiteSettingsProvider>
      </body>
    </html>
  );
}
