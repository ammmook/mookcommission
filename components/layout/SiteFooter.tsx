"use client";

import { useSiteSettings } from "@/lib/store/site-settings";

export function SiteFooter() {
  const { studioName, contactHandle } = useSiteSettings();

  return (
    <footer
      id="contact"
      className="mt-auto border-t-[1.5px] border-line bg-cream"
    >
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-1.5 px-4 py-5 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
        <span>© 2026 {studioName} · ระบบจัดการคิว Commission</span>
        {contactHandle ? <span>ติดต่อ: {contactHandle}</span> : null}
      </div>
    </footer>
  );
}
