"use client";

import React, { useState } from "react";
import {
  Wallet,
  Lock,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SharedStatCard from "@/components/shared/stat-card";
import { type Transaction } from "@/types/wallet";
import { TRANSACTIONS } from "@/data/wallet";
import { IconType } from "react-icons/lib";
import { FadeIn } from "@/components/motion/fade-in";

interface StatCard {
  label: string;
  value: string;
  icon: IconType;
  delay?: number;
}

const OVERVIEW_STATS: StatCard[] = [
  {
    label: "Total Balance",
    value: "₦235.8M",
    icon: Wallet,
    delay: 0.1,
  },
  {
    label: "Funds in Escrow",
    value: "67",
    icon: Lock,
    delay: 0.2,
  },
  {
    label: "Pending Withdrawal",
    value: "198",
    icon: Clock,
    delay: 0.3,
  },
  {
    label: "Total Paid out",
    value: "₦15.8M",
    icon: DollarSign,
    delay: 0.4,
  },
];

function StatCards({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
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

// ─── Transaction icon ─────────────────────────────────────────────────────────

function TxIcon({ type }: { type: Transaction["type"] }) {
  const map: Record<
    Transaction["type"],
    { icon: React.ReactNode; bg: string }
  > = {
    withdrawal: {
      icon: <Building2 className="w-4 h-4 text-gray-500" />,
      bg: "bg-gray-100",
    },
    fee: {
      icon: <ArrowUpRight className="w-4 h-4 text-blue-500" />,
      bg: "bg-blue-50",
    },
    payment: {
      icon: <ArrowDownLeft className="w-4 h-4 text-primary" />,
      bg: "bg-[#228A5E1A]",
    },
    refund: {
      icon: <RefreshCw className="w-4 h-4 text-primary" />,
      bg: "bg-[#228A5E1A]",
    },
    escrow: {
      icon: <Lock className="w-4 h-4 text-[#6A2AD0E5]" />,
      bg: "bg-[#6A2AD01A]",
    },
  };
  const { icon, bg } = map[type];
  return (
    <div
      className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        bg,
      )}
    >
      {icon}
    </div>
  );
}

type TxFilter = "All" | "Credit" | "Debit" | "On Hold";

export function WalletOverview() {
  const [filter, setFilter] = useState<TxFilter>("All");

  const filtered = TRANSACTIONS.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Credit") return t.amountType === "credit";
    if (filter === "Debit") return t.amountType === "debit";
    if (filter === "On Hold") return t.amountType === "neutral";
    return true;
  });

  const filters: TxFilter[] = ["All", "Credit", "Debit", "On Hold"];

  function formatAmount(tx: Transaction) {
    const abs = Math.abs(tx.amount).toLocaleString();
    if (tx.amountType === "credit") return `+${abs}`;
    if (tx.amountType === "debit") return `-${abs}`;
    return abs;
  }

  return (
    <div>
      <StatCards stats={OVERVIEW_STATS} />

      <div className="max-w-2xl mx-auto space-y-4">
        <h3 className="text-lg md:text-xl font-medium text-gray-900">
          Recent Transactions
        </h3>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "text-sm px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer",
                filter === f
                  ? "bg-[#2D7A4F] text-white"
                  : "bg-[#F2F2F2] text-gray-500 hover:bg-gray-200",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        <div className="border bg-background border-gray-100 rounded-xl overflow-hidden">
          {filtered.map((tx, idx) => (
            <div
              key={tx.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5",
                idx !== filtered.length - 1 && "border-b border-[#E0E0E0]",
              )}
            >
              <TxIcon type={tx.type} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {tx.description}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{tx.timeAgo}</p>
              </div>
              <span
                className={cn(
                  "text-sm font-semibold shrink-0",
                  tx.amountType === "credit" && "text-green-600",
                  tx.amountType === "debit" && "text-gray-800",
                  tx.amountType === "neutral" && "text-gray-600",
                )}
              >
                {formatAmount(tx)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
