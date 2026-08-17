export interface WithdrawalRequest {
  requestId: string;
  userId: string;
  user: string;
  fullName: string;
  bankName: string;
  accountNumber: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
  note?: string;
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
