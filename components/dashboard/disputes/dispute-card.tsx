"use client";

import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Dispute } from "@/types/dispute";

interface DisputeCardProps {
  dispute: Dispute;
  isSelected: boolean;
  onClick: () => void;
}

const raisedByStyles: Record<string, string> = {
  buyer: "bg-[#496DC7] text-white",
  seller: "bg-[#C27D40] text-white",
};

const statusStyles: Record<string, string> = {
  Open: "bg-yellow-50 text-yellow-600",
  Closed: "bg-green-50 text-green-700",
  "Funds released": "text-[#0E3CAB] bg-[#EDF4FE] font-medium",
  "Funds released to buyer": "text-blue-600 font-medium",
};

export function DisputeCard({
  dispute,
  isSelected,
  onClick,
}: DisputeCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-all",
        isSelected
          ? "border-primary bg-white shadow-sm"
          : "border-gray-200 bg-background hover:border-gray-300",
      )}
    >
      <div className="flex items-start justify-between gap-2 ">
        <div className="flex items-start gap-1.5">
          <div className="size-8 grid shrink-0 place-content-center bg-[#FEF3C6] rounded-full">
            <AlertTriangle className="w-4.5 h-4.5 text-yellow-500 shrink-0 mt-0.5" />
          </div>
          <span className="text-sm md:text-base font-bold text-gray-900">
            {dispute.title}
          </span>
        </div>
        <span
          className={cn(
            "text-xs shrink-0 px-2 py-0.5 rounded-full font-medium",
            statusStyles[dispute.status] ?? "text-gray-500",
          )}
        >
          {dispute.status}
        </span>
      </div>

      <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2 pl-8">{dispute.transactionId}</p>

      <div className="pl-8 mb-2">
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded-full",
            raisedByStyles[dispute.raisedBy] ?? "bg-[#496DC7] text-white",
          )}
        >
          • Raised by {dispute.raisedBy}
        </span>
      </div>

      <p className="text-xs md:text-sm font-medium  text-muted-foreground pl-8 line-clamp-2">
        {dispute.reason}
      </p>
      <p className="text-xs md:text-sm font-medium  text-muted-foreground pl-8 mt-1">{dispute.date}</p>
    </button>
  );
}
