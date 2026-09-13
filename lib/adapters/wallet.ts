import type { WithdrawalRequestDto } from "@/types/api/admin";
import type { WithdrawalRequest } from "@/types/wallet";
import { PLACEHOLDER, formatDate, humanise } from "@/lib/adapters/shared";

/**
 * Maps a row from `GET /payout-settings/withdrawals/pending` onto a table row.
 *
 * The endpoint reports the payout account and nothing about the account holder
 * — no user id, no display name — so the table's old "User" and "User ID"
 * columns have no source and are gone rather than rendered as dashes.
 */
export function toWithdrawalRequest(
  dto: WithdrawalRequestDto,
): WithdrawalRequest {
  return {
    id: dto.id ?? "",
    reference: dto.reference ?? PLACEHOLDER,
    accountName: dto.accountName ?? PLACEHOLDER,
    bankName: dto.bankName ?? PLACEHOLDER,
    accountNumber: dto.accountNumber ?? PLACEHOLDER,
    sortCode: dto.sortCode ?? undefined,
    amount: dto.amount ?? 0,
    fee: dto.fee ?? 0,
    totalDeducted: dto.totalDeducted ?? dto.amount ?? 0,
    // Symbols are the API's to supply; falling back to a naira sign would
    // mislabel a sterling payout.
    currency: dto.currency ?? "",
    // `PendingReview` reads as two words in a badge, and the enum is closed, so
    // splitting the token is safe here.
    status: dto.status ? humanise(dto.status) : PLACEHOLDER,
    date: formatDate(dto.requestedOn),
    processedDate: dto.processedOn ? formatDate(dto.processedOn) : undefined,
  };
}

/** Formats an amount in the currency the API reported it in. */
export function formatWithdrawalAmount(
  amount: number,
  currency: string,
): string {
  const value = amount.toLocaleString("en-GB", { minimumFractionDigits: 2 });
  return currency ? `${currency} ${value}` : value;
}
