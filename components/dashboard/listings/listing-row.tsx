import Image from "next/image";
import { Eye, Clock, Package } from "lucide-react";
import { Listing } from "@/types/listings";
import { StatusBadge } from "@/components/shared/status-badge";
import ListingActionMenu from "./listing-action";

export default function ListingRow({ listing }: { listing: Listing }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 p-3 md:p-4 border border-border rounded-md  hover:shadow-sm transition-shadow">
      {/* Image */}
      <div className="flex items-start justify-between">
        <div className="relative w-32 h-32 md:w-42.5 md:h-42.5 rounded-xl overflow-hidden shrink-0 bg-muted">
          {listing.images[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.title}
              className="object-cover"
              fill
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="size-8 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="block md:hidden">
          <ListingActionMenu listing={listing} />
        </div>
      </div>

      {/* Content */}
      <div className="min-w-0 md:flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="grid gap-1">
            <h3 className="font-semibold text-foreground text-base md:text-lg truncate">
              {listing.title}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground truncate">
              {listing.description}
            </p>
          </div>
          <div className="hidden md:block">
            <ListingActionMenu listing={listing} />
          </div>
        </div>
        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          <span className="text-xs bg-background font-medium rounded-full px-2.5 py-0.5 text-foreground">
            {listing.category}
          </span>
          <span className="text-xs bg-background font-medium rounded-full px-2.5 py-0.5 text-foreground">
            {listing.condition}
          </span>
          <StatusBadge status={listing.status} />
        </div>

        <hr className="border-border mt-3" />

        {/* Meta */}
        <div className="flex items-center justify-between flex-wrap gap-3 mt-2">
          <div className="flex flex-wrap items-start gap-3 md:gap-5">
            <div>
              <p className="text-xs text-muted-foreground">Listed by</p>
              <p className="text-xs md:text-sm text-foreground font-medium">
                {listing.listedBy}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-sm md:text-base text-foreground font-bold">
                {listing.formattedPrice ?? `₦${listing.price.toLocaleString()}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Brand</p>
              <p className="text-xs md:text-sm text-foreground font-medium">
                {listing.brand ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Color</p>
              <p className="text-xs md:text-sm text-foreground font-medium">
                {listing.color ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Quantity</p>
              <p className="text-xs md:text-sm text-foreground font-medium">
                {listing.quantity?.toLocaleString() ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CO₂ Impact</p>
              <p className="text-xs md:text-sm font-semibold text-primary">
                {listing.co2Impact}
              </p>
            </div>
          </div>

          {/* Right — views + time + menu */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="size-3.5" />
                {listing.views}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {listing.createdAt}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
