import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { CustomersScreen } from "@/components/admin/CustomersScreen";

export const metadata: Metadata = { title: "ลูกค้า" };

export default function AdminCustomersPage() {
  return (
    <AdminShell mobileTitle="ลูกค้า">
      <CustomersScreen />
    </AdminShell>
  );
}
