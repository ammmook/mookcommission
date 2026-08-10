import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = { title: "แดชบอร์ด" };

export default function AdminDashboardPage() {
  return (
    <AdminShell mobileTitle="แดชบอร์ด">
      <AdminDashboard />
    </AdminShell>
  );
}
