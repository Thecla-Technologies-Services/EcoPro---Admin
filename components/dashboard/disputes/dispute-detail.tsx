"use client";

import Image from "next/image";
import { Download, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReleaseSellerDialog } from "./release-seller";
import { RefundBuyerDialog } from "./refund-buyer";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Dispute } from "@/types/dispute";
import { StatusBadge } from "@/components/shared/status-badge";
import { ChatHistory } from "./chat-history";

interface DisputeDetailProps {
  dispute: Dispute;
}

export function DisputeDetail({ dispute }: DisputeDetailProps) {
  const [releaseOpen, setReleaseOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);

  const isOpen = dispute?.status === "Open";

  return (
    <div className="flex rounded-lg  flex-col gap-4 h-full overflow-y-auto py-5 px-4 bg-background">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg md:text-2xl  font-medium text-foreground">
            {dispute?.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-500">
              {dispute?.transactionId}
            </span>
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                dispute?.raisedBy === "buyer"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-orange-100 text-orange-700",
              )}
            >
              • Raised by {dispute?.raisedBy}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{dispute?.reason}</p>
        </div>

        <StatusBadge status={dispute?.status} />
      </div>

      {/* ── Transaction Details ── */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-4">
        <h3 className="text-sm font-semibold text-gray-900">
          Transaction Details
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-400">Transaction ID:</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {dispute?.transactionId}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Amount:</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {dispute?.amount}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Date:</p>
            <p className="text-sm font-semibold text-gray-900 mt-0.5">
              {dispute?.date}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
          {/* Buyer */}
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
              <Avatar>
                <AvatarImage
                  src={dispute?.buyer.avatar}
                  alt={dispute?.buyer.name}
                />
                <AvatarFallback className="bg-gray-200">
                  {dispute?.buyer.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-xs text-gray-400">Buyer</p>
              <p className="text-sm font-medium text-gray-900">
                {dispute?.buyer.name}
              </p>
            </div>
          </div>

          {/* Seller */}
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
              <Avatar>
                <AvatarImage
                  src={dispute?.seller.avatar}
                  alt={dispute?.seller.name}
                />
                <AvatarFallback className="bg-gray-200">
                  {dispute?.seller.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-xs text-gray-400">Seller</p>
              <p className="text-sm font-medium text-gray-900">
                {dispute?.seller.name}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Evidence ── */}
      <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Evidence</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {dispute?.evidence.map((ev) => (
            <div key={ev.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <ImageIcon className="w-3.5 h-3.5" />
                  {ev.label}
                </div>
                <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Download
                </button>
              </div>
              <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-100">
                {ev.url ? (
                  <Image
                    src={ev.url}
                    alt={ev.label}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-300">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Additional Note ── */}
      {dispute?.note && (
        <div className="rounded-xl border border-gray-100 bg-white p-4 space-y-1">
          <h3 className="text-sm font-semibold text-gray-900">
            Additional note
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {dispute.note}
          </p>
        </div>
      )}

      <ChatHistory messages={dispute?.messages || []} onExport={() => {}} />

      {/* ── Actions (only for Open disputes) ── */}
      {isOpen && (
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 rounded-full border-green-700 text-green-700 hover:bg-green-50"
            onClick={() => setRefundOpen(true)}
          >
            Refund Buyer
          </Button>
          <Button
            className="flex-1 rounded-full bg-green-700 text-white hover:bg-green-800"
            onClick={() => setReleaseOpen(true)}
          >
            Release to Seller
          </Button>
        </div>
      )}

      {/* ── Dialogs ── */}
      <ReleaseSellerDialog
        open={releaseOpen}
        onOpenChange={setReleaseOpen}
        amount={dispute?.amount}
        sellerName={dispute?.seller.name}
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 1500));
        }}
      />

      <RefundBuyerDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        amount={dispute?.amount}
        buyerName={dispute?.buyer.name}
        onConfirm={async () => {
          await new Promise((r) => setTimeout(r, 1500));
        }}
      />
    </div>
  );
}
