"use client";

import { AddCustomerButton } from "./AddCustomerButton";
import { AdminLoadError, AdminScreenSkeleton } from "./AdminStatus";
import { AdminPageHeading } from "./AdminPageHeading";
import { CustomerDirectory } from "./CustomerDirectory";
import { useAdminData } from "@/lib/store/admin-store";

export function CustomersScreen() {
  const { customers, lots, currentQueueNumber, loading, loadError } =
    useAdminData();

  if (loading) return <AdminScreenSkeleton />;
  if (loadError) return <AdminLoadError message={loadError} />;

  return (
    <>
      <AdminPageHeading
        title={
          <>
            ลูกค้า{" "}
            <span className="font-mono text-[13px] font-medium text-subtle">
              {customers.length}
            </span>
          </>
        }
        subtitle={`${lots.length} Lot · เรียงตามเลขคิว`}
        action={<AddCustomerButton />}
      />

      <CustomerDirectory
        currentQueueNumber={currentQueueNumber}
        addButton={<AddCustomerButton />}
      />
    </>
  );
}
