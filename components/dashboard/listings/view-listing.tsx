"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Clock, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataState } from "@/components/shared/data-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { useListing } from "@/hooks/admin/use-listings";
import { toListingRow } from "@/lib/adapters/listing";
import type { Listing } from "@/types/listings";

interface ViewListingDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listingId: string;
}

export function ViewListingDialog({
  open,
  onOpenChange,
  listingId,
}: ViewListingDialogProps) {
  // The detail endpoint is the source of truth here, not the row the table
  // already holds — and it is only asked for while the dialog is open, since a
  // listings page renders one of these per row.
  const { data, isPending, isError, error, refetch } = useListing(
    open ? listingId : undefined,
  );

  const listing = data ? toListingRow(data) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-lg gap-0 p-0 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Listing Details
          </DialogTitle>
          <DialogClose />
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <DataState>
            <DataState.Error when={isError} error={error} onRetry={refetch} />
            <DataState.Loading when={isPending || !listing}>
              <ListingDetailSkeleton />
            </DataState.Loading>
            <DataState.Content>
              {/* Keyed on the record so a different listing remounts with its
                  carousel back at the first image. */}
              {listing && <ListingDetail key={listing.id} listing={listing} />}
            </DataState.Content>
          </DataState>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ListingDetail({ listing }: { listing: Listing }) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="space-y-6">
      <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted">
        {listing.images.length === 0 ? (
          <div className="flex size-full items-center justify-center">
            <Package className="size-8 text-muted-foreground" />
          </div>
        ) : (
          <>
            <Image
              src={listing.images[current]}
              alt={listing.title}
              className="object-cover"
              fill
              // The API serves these from its own host, which is not in
              // `next.config.ts`'s `remotePatterns`; going unoptimized skips that
              // check, as the verification documents do.
              unoptimized
            />
            {listing.images.length > 1 && (
              <>
                <button
                  aria-label="Previous image"
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  className="absolute left-2.5 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/20 shadow"
                >
                  <ChevronLeft className="size-5 text-white" />
                </button>
                <button
                  aria-label="Next image"
                  onClick={() =>
                    setCurrent((c) =>
                      Math.min(listing.images.length - 1, c + 1),
                    )
                  }
                  className="absolute right-2.5 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/20 shadow"
                >
                  <ChevronRight className="size-5 text-white" />
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Title and badges on the left, price on the right */}
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-base font-semibold leading-6 text-foreground">
            {listing.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={listing.status} />
            <Pill>{listing.category}</Pill>
            <Pill>{listing.condition}</Pill>
          </div>
        </div>
        <div className="shrink-0 space-y-1 text-right">
          <p className="text-sm text-muted-foreground">Price</p>
          <p className="text-2xl font-bold text-primary">
            {listing.formattedPrice ?? `₦${listing.price.toLocaleString()}`}
          </p>
        </div>
      </div>

      <Field label="Description">
        <span className="leading-relaxed">{listing.description || "—"}</span>
      </Field>

      {listing.flagReason && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <p className="mb-1 text-xs text-muted-foreground">Flag reason</p>
          <p className="text-sm text-foreground">{listing.flagReason}</p>
        </div>
      )}

      {/* Two columns, filled row by row: Listed by / Brand, then Size / Type,
          then Location / Color, then Quantity. */}
      <div className="grid grid-cols-2 gap-x-9 gap-y-5">
        <Field label="Listed by">{listing.listedBy || "—"}</Field>
        <Field label="Brand">{listing.brand ?? "—"}</Field>
        <Field label="Size">{listing.size ?? "—"}</Field>
        <Field label="Type">{listing.type ?? "—"}</Field>
        <Field label="Location">{listing.location ?? "—"}</Field>
        <Field label="Color">{listing.color ?? "—"}</Field>
        <Field label="Quantity">
          {listing.quantity?.toLocaleString() ?? "—"}
        </Field>
      </div>

      {/* The id is a 36-character uuid, so it gets the leftover width and the
          rest of the line is held on one line rather than wrapping mid-phrase.
          The full value stays reachable on hover. */}
      <div className="flex min-w-0 items-center gap-3 text-sm font-medium text-muted-foreground">
        <Clock className="size-3.5 shrink-0" />
        <span className="whitespace-nowrap">
          Posted {listing.createdAt || "—"}
        </span>
        <span aria-hidden className="shrink-0">
          •
        </span>
        <span className="min-w-0 truncate" title={listing.id}>
          ID: {listing.id}
        </span>
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-background px-2.5 text-xs font-medium text-foreground">
      {children}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-4 text-base font-medium text-foreground">{children}</p>
    </div>
  );
}

function ListingDetailSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="h-48 w-full animate-pulse rounded-xl bg-muted" />
      <div className="space-y-2">
        <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-6 w-1/2 animate-pulse rounded-full bg-muted" />
      </div>
      <div className="h-20 w-full animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-x-9 gap-y-5">
        {Array.from({ length: 7 }, (_, index) => (
          <div key={index} className="space-y-3">
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
