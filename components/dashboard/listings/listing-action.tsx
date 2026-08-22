"use client";

import { useState } from "react";
import { Flag, FlagOff } from "lucide-react";
import {
  IoEyeOutline,
  IoCreateOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { RowActions } from "@/components/shared/row-actions";
import { ViewListingDialog } from "./view-listing";
import { FlagListingDialog } from "./flag-listing";
import { UnflagListingDialog } from "./unflag-listing";
import { DeleteListingDialog } from "./delete-listing";
import {
  useDeleteListing,
  useFlagListing,
  useUnflagListing,
} from "@/hooks/admin/use-listings";
import type { Listing } from "@/types/listing";

interface ListingActionMenuProps {
  listing: Listing;
}

type OpenDialog = "view" | "flag" | "unflag" | "delete" | null;

export default function ListingActionMenu({ listing }: ListingActionMenuProps) {
  const [open, setOpen] = useState<OpenDialog>(null);

  const flagListing = useFlagListing();
  const unflagListing = useUnflagListing();
  const deleteListing = useDeleteListing();

  const close = () => setOpen(null);
  const isFlagged = listing.status === "Flagged";

  return (
    <>
      <RowActions className="size-8 md:size-10">
        <RowActions.Item icon={IoEyeOutline} onSelect={() => setOpen("view")}>
          View Listing
        </RowActions.Item>

        {/*
          The Admin API exposes no update endpoint for a listing — only
          create, delete, flag and unflag — so there is nothing to save this
          to. Disabled rather than removed: re-enable by restoring the
          ListingFormDialog in edit mode once an endpoint exists.
        */}
        <RowActions.Item icon={IoCreateOutline} disabled>
          Edit Listing
        </RowActions.Item>

        {isFlagged ? (
          <RowActions.Item icon={FlagOff} onSelect={() => setOpen("unflag")}>
            Unflag Listing
          </RowActions.Item>
        ) : (
          <RowActions.Item icon={Flag} onSelect={() => setOpen("flag")}>
            Flag Listing
          </RowActions.Item>
        )}

        <RowActions.Item
          icon={IoTrashOutline}
          destructive
          onSelect={() => setOpen("delete")}
        >
          Delete Listing
        </RowActions.Item>
      </RowActions>

      <ViewListingDialog
        open={open === "view"}
        onOpenChange={(v) => !v && close()}
        listingId={listing.id}
      />

      {/*
        The dialogs own their loading and success state and await the callback,
        so handing them `mutateAsync` keeps that contract — a rejection
        propagates and the dialog reports it instead of showing success.
      */}
      <FlagListingDialog
        open={open === "flag"}
        onOpenChange={(v) => !v && close()}
        listing={listing}
        onFlag={async (reason) => {
          await flagListing.mutateAsync({ listingId: listing.id, reason });
        }}
      />

      <UnflagListingDialog
        open={open === "unflag"}
        onOpenChange={(v) => !v && close()}
        listing={listing}
        onUnflag={async () => {
          await unflagListing.mutateAsync(listing.id);
        }}
      />

      <DeleteListingDialog
        open={open === "delete"}
        onOpenChange={(v) => !v && close()}
        listing={listing}
        onDelete={async () => {
          await deleteListing.mutateAsync(listing.id);
        }}
      />
    </>
  );
}
