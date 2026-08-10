"use client";

import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Print / save row above the quotation. Both actions use the browser print
 * dialog — "save as PDF" is a destination inside it.
 */
export function PrintActions() {
  const print = () => window.print();

  return (
    <div className="no-print border-b-[1.5px] border-line bg-cream">
      <div className="mx-auto flex w-full max-w-3xl justify-end gap-2.5 px-4 py-2.5 sm:px-6">
        <Button variant="outline" size="sm" onClick={print}>
          <Printer size={15} aria-hidden="true" />
          พิมพ์
        </Button>
        <Button variant="dark" size="sm" onClick={print}>
          <Download size={15} aria-hidden="true" />
          บันทึก PDF
        </Button>
      </div>
    </div>
  );
}
