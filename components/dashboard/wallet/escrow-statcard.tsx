import React from "react";
import { Wallet, Lock, FileText } from "lucide-react";
import SharedStatCard from "@/components/shared/stat-card";
import { IconType } from "react-icons";
import { FadeIn } from "@/components/motion/fade-in";

interface StatCard {
  label: string;
  value: string;
  icon: IconType;
  delay?: number;
}

const ESCROW_STATS: StatCard[] = [
  {
    label: "Total Escrow Balance",
    value: "₦3.8M",
    icon: Wallet,
    delay: 0.1,
  },
  {
    label: "Funds in Escrow",
    value: "18",
    icon: Lock,
    delay: 0.2,
  },
  {
    label: "Completed Transactions",
    value: "345",
    icon: FileText,
    delay: 0.3,
  },
];

export function EscrowStatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      {ESCROW_STATS.map((s) => (
        <FadeIn key={s.label} delay={s.delay}>
          <SharedStatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
          />
        </FadeIn>
      ))}
    </div>
  );
}
