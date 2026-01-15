"use client";

import { InventoryTable } from "@/components/admin/inventory-table";
import { AddProductDialog } from "@/components/admin/add-product-dialog";

export default function AdminInventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-black italic uppercase tracking-tighter">INVENTORY CONTROL</h1>
           <p className="text-zinc-500 font-mono text-xs uppercase">
              Database: Primary Shard
           </p>
         </div>
         <AddProductDialog />
      </div>

      <InventoryTable />
    </div>
  );
}

