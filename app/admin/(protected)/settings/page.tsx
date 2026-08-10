import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminPageHeading } from "@/components/admin/AdminPageHeading";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { Card, CardHeader } from "@/components/ui/Card";
import { DEFAULT_TERMS } from "@/data/quotations";
import { Field, Textarea } from "@/components/ui/Field";

export const metadata: Metadata = { title: "ตั้งค่า" };

/**
 * Studio identity (persisted to `site_settings`) plus the quotation default.
 *
 * The default terms are a frontend constant rather than a settings row: the
 * schema has no column for them, and inventing one to make this screen easier
 * is exactly the change the brief rules out. New quotations start from
 * `DEFAULT_TERMS` and the artist edits per document.
 */
export default function AdminSettingsPage() {
  return (
    <AdminShell mobileTitle="ตั้งค่า">
      <AdminPageHeading
        title="ตั้งค่า"
        subtitle="ข้อมูลสตูดิโอและค่าเริ่มต้นของใบเสนอราคา"
      />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <SiteSettingsForm />

        <Card>
          <CardHeader title="ค่าเริ่มต้นใบเสนอราคา" />
          <Field label="เงื่อนไขเริ่มต้น" htmlFor="default-terms">
            <Textarea id="default-terms" rows={4} defaultValue={DEFAULT_TERMS} readOnly />
          </Field>
          <p className="mt-3 text-xs leading-relaxed text-subtle">
            ใบเสนอราคาใหม่จะเริ่มจากเงื่อนไขนี้ และแก้ไขได้รายใบในหน้าออกใบ
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="บัญชีผู้ดูแล" />
          <p className="mb-3.5 text-[12.5px] leading-relaxed text-body">
            เข้าสู่ระบบด้วย Supabase Auth · สิทธิ์ผู้ดูแลมาจากตาราง admins
            การเพิ่มผู้ดูแลใหม่ทำได้จาก Supabase Dashboard
          </p>
          <SignOutButton />
        </Card>
      </div>
    </AdminShell>
  );
}
