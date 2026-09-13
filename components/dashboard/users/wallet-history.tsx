"use client";
import { useState } from "react";
import Image from "next/image";
import { FilterPills } from "./pills";
import { IoLeaf } from "react-icons/io5";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  Inbox,
  Lock,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { DataState } from "@/components/shared/data-state";
import { useUserTransactions } from "@/hooks/admin/use-users";
import type { WalletFilter } from "@/types/user";
import { cn } from "@/lib/utils";
import { Amount } from "@/components/shared/amount";

/**
 * Each kind of transaction carries its own glyph and tint in the design: money
 * arriving is green, money held in escrow is purple, and money leaving — a
 * withdrawal, a platform fee, an outgoing payment — is neutral grey.
 */
const TRANSACTION_GLYPHS: Record<
  string,
  { icon: LucideIcon; className: string }
> = {
  refund: { icon: RefreshCw, className: "bg-[#228a5e]/10 text-[#228a5e]" },
  escrow: { icon: Lock, className: "bg-[#6a2ad0]/10 text-[#6a2ad0]" },
  withdrawal: { icon: Building2, className: "bg-[#f2f2f2] text-[#767676]" },
  fee: { icon: Inbox, className: "bg-[#f2f2f2] text-[#767676]" },
  credit: { icon: ArrowDownLeft, className: "bg-[#228a5e]/10 text-[#228a5e]" },
  debit: { icon: ArrowUpRight, className: "bg-[#f2f2f2] text-[#767676]" },
};

/**
 * `iconType` is a free-form server hint, so it is matched loosely against the
 * glyph keys rather than exactly; anything unrecognised falls back to the
 * direction of the transaction.
 */
function glyphFor(iconType: string | null | undefined, isCredit: boolean) {
  const hint = iconType?.toLowerCase() ?? "";
  const key = Object.keys(TRANSACTION_GLYPHS).find((name) =>
    hint.includes(name),
  );

  return TRANSACTION_GLYPHS[key ?? (isCredit ? "credit" : "debit")];
}

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
            <Amount amount={balance ?? 0} />
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

      <DataState>
        <DataState.Error
          when={isError}
          error={error}
          onRetry={() => refetch()}
          className="mt-4"
        />
        <DataState.Loading when={isPending} rows={4} rowClassName="h-9" className="mt-4" />
        <DataState.Empty when={displayed.length === 0}>
          <div className="flex flex-col items-center justify-center gap-4 text-gray-400">
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
        </DataState.Empty>
        <DataState.Content className="mt-4 space-y-3 max-h-70 overflow-y-auto pr-1">
          {displayed.map((tx) => {
            const isCredit = tx.transactionType?.toLowerCase() === "credit";
            const glyph = glyphFor(tx.iconType, isCredit);

            return (
              <div key={tx.id} className="flex items-center gap-3">
                <div
                  className={cn(
                    "size-8.5 shrink-0 rounded-full flex items-center justify-center",
                    glyph.className,
                  )}
                >
                  <glyph.icon className="size-5" strokeWidth={1.5} />
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
                  <Amount amount={tx.amount ?? 0} />
                </span>
              </div>
            );
          })}
        </DataState.Content>
      </DataState>
    </div>
  );
}
