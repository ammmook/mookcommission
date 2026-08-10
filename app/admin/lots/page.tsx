import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { LotManager } from "@/components/admin/LotManager";

export const metadata: Metadata = { title: "Lot" };

export default function AdminLotsPage() {
  return (
    <AdminShell mobileTitle="จัดการ Lot">
      <LotManager />
    </AdminShell>
  );
}
