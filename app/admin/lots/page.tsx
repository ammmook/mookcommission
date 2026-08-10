import type { Metadata } from "next";
import { AdminShell } from "@/components/layout/AdminShell";
import { AdminPageHeading } from "@/components/admin/AdminPageHeading";
import { CreateLotButton } from "@/components/admin/CreateLotButton";
import { LotCard } from "@/components/admin/LotCard";
import { customers } from "@/data/customers";
import { lots } from "@/data/lots";

export const metadata: Metadata = { title: "Lot" };

/**
 * The mockups link the sidebar's "Lot" item back to the dashboard, so this page
 * reuses the dashboard's lot card at full width rather than inventing new UI.
 */
export default function AdminLotsPage() {
  return (
    <AdminShell mobileTitle="Lot">
      <AdminPageHeading
        title="Lot ทั้งหมด"
        subtitle={`${lots.length} lot · ${customers.length} ลูกค้า`}
        action={<CreateLotButton />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {lots.map((lot) => (
          <LotCard key={lot.id} lot={lot} />
        ))}
      </div>
    </AdminShell>
  );
}
