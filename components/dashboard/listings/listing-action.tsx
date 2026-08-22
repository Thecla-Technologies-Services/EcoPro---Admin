"use client";

import { useState } from "react";
import { MoreVertical, Flag, FlagOff } from "lucide-react";
import {
  IoEyeOutline,
  IoCreateOutline,
  IoTrashOutline,
} from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewListingDialog } from "./view-listing";
import { FlagListingDialog } from "./flag-listing";
import { UnflagListingDialog } from "./unflag-listing";
import { DeleteListingDialog } from "./delete-listing";
import {
  useDeleteListing,
  useFlagListing,
  useUnflagListing,
} from "@/hooks/admin/use-listings";
import type { Listing } from "@/types/listings";

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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="size-8 md:size-10 cursor-pointer rounded-md bg-background flex items-center justify-center hover:bg-muted transition-colors outline-none">
            <MoreVertical className="size-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-44 rounded-xl shadow-lg p-1 text-foreground"
        >
          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer"
            onClick={() => setOpen("view")}
          >
            <IoEyeOutline className="size-4" />
            View Listing
          </DropdownMenuItem>

          {/*
            The Admin API exposes no update endpoint for a listing — only
            create, delete, flag and unflag — so there is nothing to save this
            to. Disabled rather than removed: re-enable by restoring the
            ListingFormDialog in edit mode once an endpoint exists.
          */}
          <DropdownMenuItem
            disabled
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
          >
            <IoCreateOutline className="size-4" />
            Edit Listing
          </DropdownMenuItem>

          {isFlagged ? (
            <DropdownMenuItem
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer"
              onClick={() => setOpen("unflag")}
            >
              <FlagOff className="size-4" />
              Unflag Listing
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer"
              onClick={() => setOpen("flag")}
            >
              <Flag className="size-4" />
              Flag Listing
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer text-destructive focus:text-destructive"
            onClick={() => setOpen("delete")}
          >
            <IoTrashOutline className="size-4" />
            Delete Listing
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
