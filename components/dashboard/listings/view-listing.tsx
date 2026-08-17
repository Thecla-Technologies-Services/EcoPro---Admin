"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import type { Listing } from "@/types/listings";

interface ViewListingDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listing: Listing;
}

export function ViewListingDialog({
  open,
  onOpenChange,
  listing,
}: ViewListingDialogProps) {
  const [current, setCurrent] = useState(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-border">
          <DialogTitle className="text-base md:text-lg text-foreground font-semibold">Listing Details</DialogTitle>
          <div className="flex items-center gap-2">
            {listing.status === "Flagged" && <StatusBadge status="Flagged" />}
            <DialogClose className="text-muted-foreground hover:text-foreground cursor-pointer">
              <X className="size-4" />
            </DialogClose>
          </div>
        </div>

        <div className="overflow-y-auto space-y-4 px-4 py-4 md:px-6 max-h-[80vh]">
          {/* Image carousel */}
          {listing.images.length > 0 && (
            <div className="relative w-full h-52">
              <Image
                src={listing.images[current]}
                alt={listing.title}
                className="w-full h-full object-cover rounded-xl"
                fill
              />
              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-8 cursor-pointer rounded-full bg-black/20 flex items-center justify-center shadow"
                  >
                    <ChevronLeft className="size-6 text-white" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrent((c) =>
                        Math.min(listing.images.length - 1, c + 1),
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-8 cursor-pointer rounded-full bg-black/20 flex items-center justify-center shadow"
                  >
                    <ChevronRight className="size-6 text-white" />
                  </button>
                </>
              )}
            </div>
          )}

          <div className="grid gap-4">
            {/* Title + price */}
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-semibold text-base leading-tight">
                {listing.title}
              </h3>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="text-lg font-bold text-primary">
                  {listing.formattedPrice ?? `₦${listing.price.toLocaleString()}`}
                </p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5">
              <StatusBadge status={listing.status} />
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-background text-muted-foreground">
                {listing.category}
              </span>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-background text-muted-foreground">
                {listing.condition}
              </span>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Description</p>
              <p className="text-sm text-foreground leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Flag reason, when an admin has flagged this listing */}
            {listing.flagReason && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Flag reason
                </p>
                <p className="text-sm text-foreground">{listing.flagReason}</p>
              </div>
            )}

            {/* Meta grid — brand, size and type are not returned by the Admin
                API, so the fields it does provide are shown instead. */}
            <div className="grid grid-cols-2 gap-y-4 md:gap-y-5">
              {[
                { label: "Listed by", value: listing.listedBy },
                { label: "Customer code", value: listing.customerAccountCode ?? "—" },
                { label: "CO₂ impact", value: listing.co2Impact },
                { label: "Views", value: String(listing.views) },
                {
                  label: "Created",
                  value: listing.createdByAdmin
                    ? `${listing.createdAt} (by admin)`
                    : listing.createdAt || "—",
                },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs md:text-sm font-medium text-muted-foreground">{item.label}</p>
                  <p className="text-sm md:text-base font-semibold text-foreground mt-0.5">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
