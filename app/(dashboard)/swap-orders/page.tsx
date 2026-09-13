"use client";

import { Package, Truck } from "lucide-react";
import { FadeIn } from "@/components/motion/fade-in";
import { IoCartOutline } from "react-icons/io5";
import { HiOutlineDocumentCheck } from "react-icons/hi2";
import SharedStatCard from "@/components/shared/stat-card";
import SwapTable from "@/components/dashboard/swap-orders/swap-table";
import { useSwapOrdersPanel } from "@/hooks/admin/use-swap-orders";

export default function SwapsOrdersPage() {
  const panel = useSwapOrdersPanel({ pageSize: 10 });

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="grid gap-2">
        <h1 className="text-2xl md:text-[28px] font-bold">Swaps & Orders</h1>
        <p className="text-sm text-muted-foreground">
          Track all transactions and deliveries
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 ">
        <FadeIn delay={0.1}>
          {/* Only the total has a source, and it counts disputed swaps rather
              than orders. The other three are shown as a dash rather than a
              number no endpoint stands behind. */}
          <SharedStatCard
            label="Total Orders"
            value={panel.table.totalCount ?? 0}
            isLoading={panel.query.isPending}
            icon={IoCartOutline}
          />
        </FadeIn>

        <FadeIn delay={0.2}>
          <SharedStatCard label="Pending Pickup" value="—" icon={Package} />
        </FadeIn>
        <FadeIn delay={0.3}>
          <SharedStatCard label="In Transit" value="—" icon={Truck} />
        </FadeIn>
        <FadeIn delay={0.4}>
          <SharedStatCard
            label="Completed"
            value="—"
            icon={HiOutlineDocumentCheck}
          />
        </FadeIn>
      </div>
      <SwapTable />
    </div>
  );
}
