/**
 * A withdrawal request as the wallet table renders it.
 *
 * Mapped from `WithdrawalRequestDto` in `lib/adapters/wallet.ts`. What the API
 * does not carry is absent rather than optional-and-always-empty: the DTO names
 * the payout account but not the user behind it, so there is no user id or
 * display name here — `accountName` is the closest the endpoint gets.
 */
export interface WithdrawalRequest {
  /** The API's GUID, which the approve and reject endpoints take. */
  id: string;
  /** The human-facing reference, e.g. `WD-53156908`. */
  reference: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  sortCode?: string;
  amount: number;
  fee: number;
  totalDeducted: number;
  currency: string;
  /** The API's own vocabulary — see `WithdrawalStatus`. */
  status: string;
  date: string;
  processedDate?: string;
}

export interface EscrowTransaction {
  orderId: string;
  item: string;
  buyer: string;
  seller: string;
  amount: number;
  status: "In Transit" | "Delivered" | "Paused" | "Disputed";
  held: string;
  dateCreated: string;
}

export interface Transaction {
  id: string;
  type: "withdrawal" | "fee" | "payment" | "refund" | "escrow";
  description: string;
  timeAgo: string;
  amount: number;
  amountType: "debit" | "credit" | "neutral";
}
