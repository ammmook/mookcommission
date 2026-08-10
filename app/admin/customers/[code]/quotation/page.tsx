import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { QuotationBuilder } from "@/components/admin/QuotationBuilder";
import { getCustomerByCode } from "@/data/customers";

export async function generateMetadata({
  params,
}: PageProps<"/admin/customers/[code]/quotation">): Promise<Metadata> {
  const { code } = await params;
  const customer = getCustomerByCode(code);
  return {
    title: customer ? `ใบเสนอราคา · ${customer.name}` : "ใบเสนอราคา",
  };
}

export default async function AdminQuotationPage({
  params,
}: PageProps<"/admin/customers/[code]/quotation">) {
  const { code } = await params;
  const seed = getCustomerByCode(code);
  if (!seed) notFound();

  return (
    <AdminShell
      mobileTitle="ใบเสนอราคา"
      mobileBack={{
        href: `/admin/customers/${seed.code}`,
        label: "กลับหน้าลูกค้า",
      }}
      mobileMeta={seed.code}
      showTabBar={false}
      hasStickyBar
    >
      <QuotationBuilder code={seed.code} />
    </AdminShell>
  );
}
