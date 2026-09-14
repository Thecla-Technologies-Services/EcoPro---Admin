import { ChatRole } from "@/components/dashboard/disputes/chat-history";
import type { Country } from "@/types/api/admin";

export interface DisputeParty {
  name: string;
  avatar?: string;
}

export interface DisputeEvidence {
  label: string;
  url: string;
}

export type DisputeStatus = "Open" | "Closed" | "Resolved" | "In Progress";
export type DisputeRaisedBy = "buyer" | "seller";

export interface Dispute {
  id: string;
  title: string;
  transactionId: string;
  raisedBy: DisputeRaisedBy;
  reason: string;
  date: string;         
  fullDate: string;     // full datetime e.g. "Feb 7, 2026 11:12 PM"
  status: DisputeStatus;
  /**
   * The API's own `Country` token, not the displayed label.
   *
   * Fixture-only, like every field on this type: no endpoint serves a dispute,
   * and the nearest live source — `GET /api/admin/swaps/disputed`, which the
   * Swap & Orders module stands on — returns a `SwapProposalDto` with no
   * country on it. So this is written in `data/disputes.ts` rather than mapped
   * from anywhere, and needs a real source before the column can be trusted.
   */
  country: Country;
  amount: string;       // formatted e.g. "₦180,000"
  buyer: DisputeParty;
  seller: DisputeParty;
  evidence: DisputeEvidence[];
  note?: string;
  messages?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sender: string;
  avatarUrl?: string;
  role: ChatRole;
  message: string;
  timestamp: Date | string;
}