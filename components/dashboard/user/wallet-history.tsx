"use client";
import { useState } from "react";
import Image from "next/image";
import { FilterPills } from "./pills";
import { IoLeaf } from "react-icons/io5";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/shared/query-error";
import { useUserTransactions } from "@/hooks/admin/use-users";
import type { WalletFilter } from "@/types/user";
import { cn } from "@/lib/utils";

/** The pills map onto the endpoint's `transactionType` filter. */
const TRANSACTION_TYPE_PARAMS: Partial<Record<WalletFilter, string>> = {
  Credit: "Credit",
  Debit: "Debit",
};

interface WalletHistoryTabProps {
  userId?: string;
  balance?: number;
  ecoPoints?: number;
}

export function WalletHistoryTab({
  userId,
  balance,
  ecoPoints,
}: WalletHistoryTabProps) {
  const [filter, setFilter] = useState<WalletFilter>("All");

  const { data, isPending, isError, error, refetch } = useUserTransactions(
    userId,
    TRANSACTION_TYPE_PARAMS[filter]
  );

  const displayed = data?.data ?? [];

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-background rounded-md py-3 md:py-5 px-3 md:px-4 text-left">
          <p className="text-xs font-medium text-[#6C6C6C]">Total Balance</p>
          <p className="text-xl font-bold text-gray-900">
            ₦{(balance ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-background rounded-md py-3 md:py-5 px-3 md:px-4 text-left">
          <p className="text-xs font-medium text-[#6C6C6C]">Eco-Points</p>
          <p className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-1">
            <IoLeaf className="text-primary size-4 md:size-5" />{" "}
            {(ecoPoints ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      <FilterPills
        options={["All", "Credit", "Debit"] as WalletFilter[]}
        active={filter}
        onChange={setFilter}
      />

      {isPending ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-9 w-full" />
          ))}
        </div>
      ) : isError ? (
        <QueryError error={error} onRetry={() => refetch()} className="mt-4" />
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16 text-gray-400">
          <Image
            src="/assets/images/wallet-empty-state.png"
            alt="No transactions"
            width={90}
            height={90}
          />

          <p className="text-sm md:text-base font-medium text-foreground">
            No Transactions for now
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3 max-h-70 overflow-y-auto pr-1">
          {displayed.map((tx) => {
            const isCredit = tx.transactionType?.toLowerCase() === "credit";

            return (
              <div key={tx.id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base shrink-0">
                  {/* `iconType` is a server-side hint; fall back to a glyph
                      derived from the direction of the transaction. */}
                  {tx.iconType ?? (isCredit ? "↓" : "↑")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {tx.title}
                  </p>
                  <p className="text-xs text-gray-400">{tx.timeAgo}</p>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold shrink-0",
                    isCredit ? "text-green-600" : "text-gray-700",
                  )}
                >
                  {isCredit ? "+" : ""}
                  {(tx.amount ?? 0).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
