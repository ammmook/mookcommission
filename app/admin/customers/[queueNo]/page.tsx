import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { CustomerEditor } from "@/components/admin/CustomerEditor";
import { customers, getCustomerByQueueNumber } from "@/data/customers";
import { getLot } from "@/data/lots";
import { getQuotation } from "@/data/quotations";
import { queueTag } from "@/lib/format";

export function generateStaticParams() {
  return customers
    .filter((customer) => customer.lotId === "lot-03")
    .map((customer) => ({ queueNo: String(customer.queueNumber) }));
}

export async function generateMetadata({
  params,
}: PageProps<"/admin/customers/[queueNo]">): Promise<Metadata> {
  const { queueNo } = await params;
  const customer = getCustomerByQueueNumber(Number(queueNo));
  return {
    title: customer
      ? `${queueTag(customer.queueNumber)} ${customer.name}`
      : "ไม่พบลูกค้า",
  };
}

export default async function AdminCustomerPage({
  params,
}: PageProps<"/admin/customers/[queueNo]">) {
  const { queueNo } = await params;
  const customer = getCustomerByQueueNumber(Number(queueNo));
  if (!customer) notFound();

  const lot = getLot(customer.lotId);
  if (!lot) notFound();

  return (
    <AdminShell
      mobileTitle={`${queueTag(customer.queueNumber)} ${customer.name}`}
      mobileBack={{ href: "/admin/customers", label: "กลับรายชื่อลูกค้า" }}
      mobileMeta={customer.code}
      showTabBar={false}
      hasStickyBar
    >
      <CustomerEditor
        customer={customer}
        lot={lot}
        quotation={getQuotation(customer.quotationId)}
      />
    </AdminShell>
  );
}
