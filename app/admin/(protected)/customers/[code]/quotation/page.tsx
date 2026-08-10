import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { QuotationBuilder } from "@/components/admin/QuotationBuilder";
import { getCustomerByCode } from "@/lib/supabase/queues";
import { supabaseServer } from "@/lib/supabase/server";

async function loadHeading(code: string) {
  const db = await supabaseServer();
  return getCustomerByCode(db, code);
}

export async function generateMetadata({
  params,
}: PageProps<"/admin/customers/[code]/quotation">): Promise<Metadata> {
  const { code } = await params;
  const customer = await loadHeading(code);
  return {
    title: customer ? `ใบเสนอราคา · ${customer.name}` : "ใบเสนอราคา",
  };
}

export default async function AdminQuotationPage({
  params,
}: PageProps<"/admin/customers/[code]/quotation">) {
  const { code } = await params;
  const customer = await loadHeading(code);
  if (!customer) notFound();

  return (
    <AdminShell
      mobileTitle="ใบเสนอราคา"
      mobileBack={{
        href: `/admin/customers/${customer.code}`,
        label: "กลับหน้าลูกค้า",
      }}
      mobileMeta={customer.code}
      showTabBar={false}
      hasStickyBar
    >
      <QuotationBuilder code={customer.code} />
    </AdminShell>
  );
}
