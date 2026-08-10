import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminPageHeading } from "@/components/admin/AdminPageHeading";
import { LinkButton } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Field, FormGrid, Input, Textarea } from "@/components/ui/Field";

export const metadata: Metadata = { title: "ตั้งค่า" };

/**
 * The sidebar links here but the mockups don't specify a settings screen, so
 * this stays deliberately small: studio identity and the default terms that
 * new quotations inherit.
 */
export default function AdminSettingsPage() {
  return (
    <AdminShell mobileTitle="ตั้งค่า">
      <AdminPageHeading
        title="ตั้งค่า"
        subtitle="ข้อมูลสตูดิโอและค่าเริ่มต้นของใบเสนอราคา"
      />

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="ข้อมูลสตูดิโอ" />
          <FormGrid>
            <Field label="ชื่อสตูดิโอ" htmlFor="studio-name">
              <Input id="studio-name" defaultValue="ต่อคิว Studio" />
            </Field>
            <Field label="บัญชีติดต่อ" htmlFor="studio-contact">
              <Input id="studio-contact" defaultValue="@torqueue.art" mono />
            </Field>
            <Field label="อีเมล" htmlFor="studio-email" full>
              <Input
                id="studio-email"
                type="email"
                defaultValue="artist@torqueue.art"
              />
            </Field>
          </FormGrid>
        </Card>

        <Card>
          <CardHeader title="ค่าเริ่มต้นใบเสนอราคา" />
          <Field label="เงื่อนไขเริ่มต้น" htmlFor="default-terms">
            <Textarea
              id="default-terms"
              rows={4}
              defaultValue="มัดจำ 50% ก่อนเริ่มลงสี · แก้ไขได้ 2 ครั้ง · ไฟล์ส่งภายใน 14 วันหลังชำระครบ"
            />
          </Field>
          <p className="mt-3 text-xs leading-relaxed text-subtle">
            ยังไม่มีการเชื่อมต่อฐานข้อมูล — การเปลี่ยนแปลงในหน้านี้ยังไม่ถูกบันทึก
          </p>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="บัญชีผู้ดูแล" />
          <p className="mb-3.5 text-[12.5px] leading-relaxed text-body">
            ระบบยังใช้การเข้าสู่ระบบจำลอง เมื่อเชื่อมต่อ Supabase แล้ว
            ส่วนนี้จะจัดการรหัสผ่านและ session
          </p>
          <LinkButton href="/admin/login" variant="outline">
            ออกจากระบบ
          </LinkButton>
        </Card>
      </div>
    </AdminShell>
  );
}
