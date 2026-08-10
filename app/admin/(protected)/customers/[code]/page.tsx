import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { CustomerEditor } from "@/components/admin/CustomerEditor";
import { queueTag } from "@/lib/format";
import { getCustomerByCode } from "@/lib/supabase/queues";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * The shell's header needs the queue number and name before the client store
 * has loaded, so this reads the entry server-side. The editor itself still
 * reads from the store, because a customer's lot and queue number can change
 * while the session is open.
 */
async function loadHeading(code: string) {
  const db = await supabaseServer();
  return getCustomerByCode(db, code);
}

export async function generateMetadata({
  params,
}: PageProps<"/admin/customers/[code]">): Promise<Metadata> {
  const { code } = await params;
  const customer = await loadHeading(code);
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
  const customer = await loadHeading(code);
  if (!customer) notFound();

  return (
    <AdminShell
      mobileTitle={`${queueTag(customer.queueNumber)} ${customer.name}`}
      mobileBack={{ href: "/admin/customers", label: "กลับรายชื่อลูกค้า" }}
      mobileMeta={customer.code}
      showTabBar={false}
      hasStickyBar
    >
      <CustomerEditor code={customer.code} />
    </AdminShell>
  );
}
