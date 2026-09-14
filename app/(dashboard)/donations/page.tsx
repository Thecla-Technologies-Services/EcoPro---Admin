import { ShoppingCart, Package, Truck, FileCheck } from "lucide-react";
import { DonationsTable } from "@/components/dashboard/donations/donation-table";
import SharedStatCard from "@/components/shared/stat-card";
import { IconType } from "react-icons/lib";
import { StatGrid } from "@/components/shared/stat-grid";
import { BiSolidError } from "react-icons/bi";

interface StatCard {
  label: string;
  value: string;
  icon: IconType;
}

const STATS: StatCard[] = [
  {
    label: "Total Donations",
    value: "12,204",
    icon: ShoppingCart,
  },
  {
    label: "Pending Pickup",
    value: "67",
    icon: Package,
  },
  {
    label: "In Transit",
    value: "198",
    icon: Truck,
  },
  {
    label: "Completed",
    value: "145",
    icon: FileCheck,
  },
  {
    label: "Cancelled",
    value: "2",
    icon: BiSolidError,
  },
];

export default function DonationsPage() {
  return (
    <div className="w-full space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-[28px] font-semibold text-gray-900">
          Donations
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track all the donations on the platform
        </p>
      </div>
      {/* Five across, so Cancelled sits on the row with the rest rather than
          wrapping alone under a four-column grid. */}
      <StatGrid columns={5} className="gap-3">
        {STATS.map((s) => (
          <SharedStatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
          />
        ))}
      </StatGrid>

      {/* Table */}
      <DonationsTable />
    </div>
  );
}
