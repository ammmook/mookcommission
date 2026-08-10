"use client";

import { AddCustomerButton } from "./AddCustomerButton";
import { AdminPageHeading } from "./AdminPageHeading";
import { CustomerDirectory } from "./CustomerDirectory";
import { currentQueueNumber } from "@/data/customers";
import { useAdminData } from "@/lib/store/admin-store";

export function CustomersScreen() {
  const { customers, lots } = useAdminData();

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
