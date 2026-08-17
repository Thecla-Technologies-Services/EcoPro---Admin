import { ShoppingCart, Package, Truck, FileCheck } from "lucide-react";
import { DonationsTable } from "@/components/dashboard/donation/donation-table";
import SharedStatCard from "@/components/shared/stat-card";
import { IconType } from "react-icons/lib";
import { FadeIn } from "@/components/motion/fade-in";

interface StatCard {
  label: string;
  value: string;
  icon: IconType;
  delay: number;
}

const STATS: StatCard[] = [
  {
    label: "Total Donations",
    value: "12,204",
    icon: ShoppingCart,
    delay: 0.1,
  },
  {
    label: "Pending Pickup",
    value: "67",
    icon: Package,
    delay: 0.2,
  },
  {
    label: "In Transit",
    value: "198",
    icon: Truck,
    delay: 0.3,
  },
  {
    label: "Completed",
    value: "145",
    icon: FileCheck,
    delay: 0.4,
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s) => (
          <FadeIn key={s.label} delay={s.delay}>
            <SharedStatCard label={s.label} value={s.value} icon={s.icon} />
          </FadeIn>
        ))}
      </div>

      {/* Table */}
      <DonationsTable />
    </div>
  );
}
