"use client";

import React, { useRef } from "react";
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
import { TRANSACTIONS } from "@/data/transactions";
import { IconType } from "react-icons/lib";
import { FadeIn } from "@/components/motion/fade-in";
import { Amount } from "@/components/shared/amount";
import { Pagination } from "@/components/shared/pagination";
import { useFixturePanel } from "@/hooks/shared/use-fixture-panel";
import { TableSearchInput } from "@/components/shared/table-search-input";

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

const OVERVIEW_STATS: StatCard[] = [
  {
    label: "Total Balance",
    value: "₦235.8M",
    amount: 235_800_000,
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
    amount: 15_800_000,
    icon: DollarSign,
    delay: 0.4,
  },
];

function StatCards({ stats }: { stats: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
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

const TX_FILTERS: TxFilter[] = ["All", "Credit", "Debit", "On Hold"];

/** Each pill but "All" names one of the ledger directions a row carries. */
const TX_FILTER_TYPES: Record<string, Transaction["amountType"]> = {
  Credit: "credit",
  Debit: "debit",
  "On Hold": "neutral",
};

const PAGE_SIZE = 10;

export function WalletOverview() {
  // Anchors paging to whichever region the list scrolls in — the dashboard
  // `main` here, so a page change starts at the top of the list.
  const listRef = useRef<HTMLDivElement>(null);

  /**
   * Fixture rows, so the filter and the page position are applied in memory.
   * Behind the same seam the live lists use: when the transactions endpoint
   * arrives this becomes a `useListPanel`, and the markup below stays put.
   */
  const panel = useFixturePanel<Transaction>({
    rows: TRANSACTIONS,
    pageSize: PAGE_SIZE,
    initialFilters: { tab: "All" },
    matches: (tx, term, { tab }) => {
      if (tab !== "All" && tx.amountType !== TX_FILTER_TYPES[tab ?? "All"]) {
        return false;
      }
      if (!term) return true;

      // Searched in memory with the rows: these are fixtures, so there is no
      // endpoint to hand a term to. A row shows its description and its kind,
      // and the amount is what an admin is likeliest to type after those.
      return [tx.description, tx.type, String(tx.amount)].some((field) =>
        field.toLowerCase().includes(term.toLowerCase()),
      );
    },
  });

  const { pageIndex, pageSize } = panel.table.pagination;

  /** Ledger rows carry their direction in the sign, not in the figure. */
  function amountSign(tx: Transaction) {
    if (tx.amountType === "credit") return "+";
    if (tx.amountType === "debit") return "-";
    return "";
  }

  return (
    <div>
      <StatCards stats={OVERVIEW_STATS} />

      <div ref={listRef} className="max-w-2xl mx-auto space-y-4">
        <h3 className="text-lg md:text-xl font-medium text-gray-900">
          Recent Transactions
        </h3>

        {/* Filter tabs, with search opposite them */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            {TX_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => panel.table.onTabChange(f)}
                className={cn(
                  "text-sm px-4 py-1.5 rounded-full font-medium transition-all cursor-pointer",
                  panel.table.activeTab === f
                    ? "bg-[#2D7A4F] text-white"
                    : "bg-[#F2F2F2] text-gray-500 hover:bg-gray-200",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <TableSearchInput
            value={panel.table.search}
            onChange={panel.table.onSearchChange}
            placeholder="Search transactions"
            className="mt-0 w-full md:mt-0 md:w-56"
          />
        </div>

        {/* Transaction list */}
        <div className="border bg-background border-gray-100 rounded-xl overflow-hidden">
          {panel.rows.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No transactions match this search.
            </p>
          )}
          {panel.rows.map((tx, idx) => (
            <div
              key={tx.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5",
                idx !== panel.rows.length - 1 && "border-b border-[#E0E0E0]",
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
                <Amount amount={Math.abs(tx.amount)} sign={amountSign(tx)} />
              </span>
            </div>
          ))}
        </div>

        <Pagination
          current={pageIndex + 1}
          total={panel.table.totalPages ?? 1}
          onChange={(page) =>
            panel.table.onPaginationChange({ pageIndex: page - 1, pageSize })
          }
          totalCount={panel.table.totalCount}
          pageSize={pageSize}
          rowsOnPage={panel.rows.length}
          rowLabel="transactions"
          scrollAnchorRef={listRef}
          className="px-1"
        />
      </div>
    </div>
  );
}
