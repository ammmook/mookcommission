import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { QuotationBuilder } from "@/components/admin/QuotationBuilder";
import { getCustomerByQueueNumber } from "@/data/customers";
import { getLot } from "@/data/lots";
import { getQuotation } from "@/data/quotations";
import type { Quotation } from "@/lib/types";

export async function generateMetadata({
  params,
}: PageProps<"/admin/customers/[queueNo]/quotation">): Promise<Metadata> {
  const { queueNo } = await params;
  const customer = getCustomerByQueueNumber(Number(queueNo));
  return {
    title: customer ? `ใบเสนอราคา · ${customer.name}` : "ใบเสนอราคา",
  };
}

export default async function AdminQuotationPage({
  params,
}: PageProps<"/admin/customers/[queueNo]/quotation">) {
  const { queueNo } = await params;
  const customer = getCustomerByQueueNumber(Number(queueNo));
  if (!customer) notFound();

  const lot = getLot(customer.lotId);
  if (!lot) notFound();

  // Customers without a quotation start from a blank draft.
  const quotation: Quotation = getQuotation(customer.quotationId) ?? {
    id: `qt-new-${customer.id}`,
    number: "QT-2569-NEW",
    customerId: customer.id,
    status: "draft",
    lines: [{ id: "l1", item: "", qty: 1, price: 0 }],
    discount: 0,
    terms:
      "มัดจำ 50% ก่อนเริ่มลงสี · แก้ไขได้ 2 ครั้ง · ไฟล์ส่งภายใน 14 วันหลังชำระครบ",
  };

  return (
    <AdminShell
      mobileTitle="ใบเสนอราคา"
      mobileBack={{
        href: `/admin/customers/${customer.queueNumber}`,
        label: "กลับหน้าลูกค้า",
      }}
      mobileMeta={customer.code}
      showTabBar={false}
      hasStickyBar
    >
      <QuotationBuilder
        customer={customer}
        lot={lot}
        quotation={quotation}
      />
    </AdminShell>
  );
}
