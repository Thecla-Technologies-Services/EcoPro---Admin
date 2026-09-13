import React from "react";
import { Wallet, Lock, FileText } from "lucide-react";
import SharedStatCard from "@/components/shared/stat-card";
import { IconType } from "react-icons";
import { FadeIn } from "@/components/motion/fade-in";
import { Amount } from "@/components/shared/amount";

interface StatCard {
  label: string;
  value: string;
  icon: IconType;
  delay?: number;
  /**
   * The figure as a number, for the cards that hold money. Set here so the card
   * can convert; the counts beside them have no currency and keep their string.
   */
  amount?: number;
}

const ESCROW_STATS: StatCard[] = [
  {
    label: "Total Escrow Balance",
    value: "₦3.8M",
    amount: 3_800_000,
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
            // A money card converts; a count is a count in every currency.
            value={
              s.amount === undefined ? (
                s.value
              ) : (
                <Amount amount={s.amount} compact />
              )
            }
            icon={s.icon}
          />
        </FadeIn>
      ))}
    </div>
  );
}
