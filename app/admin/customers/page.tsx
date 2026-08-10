import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { AddCustomerButton } from "@/components/admin/AddCustomerButton";
import { AdminPageHeading } from "@/components/admin/AdminPageHeading";
import { CustomerDirectory } from "@/components/admin/CustomerDirectory";
import { currentQueueNumber, customers } from "@/data/customers";

export const metadata: Metadata = { title: "ลูกค้า" };

export default function AdminCustomersPage() {
  // Newest lot first, then by queue number — matches "เรียงตามเลขคิว".
  const sorted = [...customers].sort(
    (a, b) =>
      b.lotId.localeCompare(a.lotId) || a.queueNumber - b.queueNumber,
  );

  return (
    <AdminShell mobileTitle={`ลูกค้า ${customers.length}`}>
      <AdminPageHeading
        title={
          <>
            ลูกค้า{" "}
            <span className="font-mono text-[13px] font-medium text-subtle">
              {customers.length}
            </span>
          </>
        }
        subtitle="ทุก Lot · เรียงตามเลขคิว"
        action={<AddCustomerButton />}
      />

      <CustomerDirectory
        customers={sorted}
        currentQueueNumber={currentQueueNumber}
        addButton={<AddCustomerButton />}
      />
    </AdminShell>
  );
}
