import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { CustomerEditor } from "@/components/admin/CustomerEditor";
import { customers, getCustomerByCode } from "@/data/customers";
import { queueTag } from "@/lib/format";

export function generateStaticParams() {
  return customers.map((customer) => ({ code: customer.code }));
}

export async function generateMetadata({
  params,
}: PageProps<"/admin/customers/[code]">): Promise<Metadata> {
  const { code } = await params;
  const customer = getCustomerByCode(code);
  return {
    title: customer
      ? `${queueTag(customer.queueNumber)} ${customer.name}`
      : "ไม่พบลูกค้า",
  };
}

export default async function AdminCustomerPage({
  params,
}: PageProps<"/admin/customers/[code]">) {
  const { code } = await params;
  // Seed lookup only — the editor reads live data from the admin store, since
  // a customer's lot and queue number can change while the session is open.
  const seed = getCustomerByCode(code);
  if (!seed) notFound();

  return (
    <AdminShell
      mobileTitle={`${queueTag(seed.queueNumber)} ${seed.name}`}
      mobileBack={{ href: "/admin/customers", label: "กลับรายชื่อลูกค้า" }}
      mobileMeta={seed.code}
      showTabBar={false}
      hasStickyBar
    >
      <CustomerEditor code={seed.code} />
    </AdminShell>
  );
}
