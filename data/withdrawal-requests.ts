import type { WithdrawalRequest } from "@/types/wallet";

/**
 * Stand-in rows until the withdrawal endpoints are wired.
 *
 * Here rather than inside the table so the table renders whatever its panel
 * hands it, and so going live is a change of adapter rather than a change of
 * component.
 */
export const WITHDRAWAL_REQUESTS: WithdrawalRequest[] = Array.from(
  { length: 20 },
  (_, i) => ({
    requestId: "WD-53156908",
    userId: "USR-1245",
    user: "Tayo Igbira",
    fullName: "Tayo Igbira Adewale",
    bankName: "Access Bank PLC",
    accountNumber: "0123672348",
    amount: 125000,
    status: (["Pending", "Approved", "Rejected"] as const)[i % 3],
    date: "Feb 7, 2026, 11:23 PM",
    note:
      i % 3 === 2
        ? "The request was rejected because the account number provided is incorrect."
        : undefined,
  }),
);
