import type { ChatMessage, Dispute } from "@/types/dispute";


/** Attached to every mock dispute below; nothing outside this file reads it. */
const messages: ChatMessage[] = [
  {
    id: "1",
    sender: "Adewale Joel",
    role: "Buyer",
    message: "The phone only cost about 1.5m, how much will you pay for it.",
    timestamp: "2026-07-08T11:30:00",
  },
  {
    id: "2",
    sender: "Bayo Adenuga",
    role: "Seller",
    message: "What is the deal all about and what",
    timestamp: "2026-07-08T11:31:00",
  },
];

/**
 * Stand-in rows for a disputes endpoint the Admin API does not document.
 *
 * `country` in particular is invented here: no endpoint carries a dispute's
 * country, so these values are illustrative and the table column they feed is
 * not live data.
 */
export const DISPUTES: Dispute[] = [
  {
    id: "1",
    title: "Iphone 13 Pro Max",
    transactionId: "TRX-4521",
    raisedBy: "buyer",
    reason: "Item condition mismatch – Buyer claims screen is cracked",
    date: "Feb 7, 2026",
    status: "Open",
    country: "Nigeria",
    amount: "₦180,000",
    fullDate: "Feb 7, 2026 11:12 PM",
    messages: messages,
    buyer: { name: "Kolawole Adebiyi", avatar: "" },
    seller: { name: "Kolawole Adebiyi", avatar: "" },
    evidence: [
      { label: "Proof of delivery", url: "/mock/proof.jpg" },
      { label: "Damage Evidence", url: "/mock/damage.jpg" },
    ],
    note: "The item sold to me was so faulty and I have been trying to message him, he is not answering my call at all. It seems he is not ready to do the right thing.",
  },
  {
    id: "2",
    title: "Iphone 13 Pro Max",
    transactionId: "TRX-4521",
    raisedBy: "seller",
    reason: "Item condition mismatch – Buyer claims screen is cracked",
    date: "Feb 7, 2026",
    status: "Open",
    country: "Ghana",
    amount: "₦180,000",
    fullDate: "Feb 7, 2026 11:12 PM",
    messages: messages,
    buyer: { name: "Kolawole Adebiyi", avatar: "" },
    seller: { name: "Bayo Adenuga", avatar: "" },
    evidence: [
      { label: "Proof of delivery", url: "/mock/proof.jpg" },
      { label: "Damage Evidence", url: "/mock/damage.jpg" },
    ],
    note: "The item sold to me was so faulty and I have been trying to message him, he is not answering my call at all. It seems he is not ready to do the right thing.",
  },
  {
    id: "3",
    title: "Iphone 13 Pro Max",
    transactionId: "TRX-4521",
    raisedBy: "buyer",
    reason: "Item condition mismatch – Buyer claims screen is cracked",
    date: "Feb 7, 2026",
    status: "Closed",
    country: "UnitedKingdom",
    amount: "₦180,000",
    messages: messages,
    fullDate: "Feb 7, 2026 11:12 PM",
    buyer: { name: "Kolawole Adebiyi", avatar: "" },
    seller: { name: "Kolawole Adebiyi", avatar: "" },
    evidence: [
      { label: "Proof of delivery", url: "/mock/proof.jpg" },
      { label: "Damage Evidence", url: "/mock/damage.jpg" },
    ],
    note: "The item sold to me was so faulty and I have been trying to message him, he is not answering my call at all. It seems he is not ready to do the right thing.",
  },
  {
    id: "4",
    title: "Iphone 13 Pro Max",
    transactionId: "TRX-4521",
    raisedBy: "buyer",
    reason: "Item condition mismatch – Buyer claims screen is cracked",
    date: "Feb 7, 2026",
    status: "In Progress",
    country: "Nigeria",
    messages: messages,
    amount: "₦180,000",
    fullDate: "Feb 7, 2026 11:12 PM",
    buyer: { name: "Adewale Joel", avatar: "" },
    seller: { name: "Kolawole Adebiyi", avatar: "" },
    evidence: [
      { label: "Proof of delivery", url: "/mock/proof.jpg" },
      { label: "Damage Evidence", url: "/mock/damage.jpg" },
    ],
    note: "The item sold to me was so faulty and I have been trying to message him, he is not answering my call at all. It seems he is not ready to do the right thing.",
  },

  {
    id: "5",
    title: "Iphone 13 Pro Max",
    transactionId: "TRX-4521",
    raisedBy: "buyer",
    reason: "Item condition mismatch – Buyer claims screen is cracked",
    date: "Feb 7, 2026",
    status: "Resolved",
    country: "Ghana",
    amount: "₦180,000",
    messages: messages,
    fullDate: "Feb 7, 2026 11:12 PM",
    buyer: { name: "Adewale Joel", avatar: "" },
    seller: { name: "Kolawole Adebiyi", avatar: "" },
    evidence: [
      { label: "Proof of delivery", url: "/mock/proof.jpg" },
      { label: "Damage Evidence", url: "/mock/damage.jpg" },
    ],
    note: "The item sold to me was so faulty and I have been trying to message him, he is not answering my call at all. It seems he is not ready to do the right thing.",
  },
];


