"use client";
import { useState } from "react";
import Image from "next/image";
import { IoEyeOutline } from "react-icons/io5";
import { FilterPills, ListingTypeBadge } from "./pills";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/shared/query-error";
import { useUserListings } from "@/hooks/admin/use-users";
import type { ListingFilter } from "@/types/user";

/** Placeholder for a listing the API returns without an image. */
const FALLBACK_IMAGE = "/assets/images/all-listing-empty.png";

/**
 * The pills double as the API's `listingType` filter — "All" omits the
 * parameter so the endpoint returns every type.
 */
const LISTING_TYPE_PARAMS: Partial<Record<ListingFilter, string>> = {
  Sell: "Sell",
  Swap: "Swap",
  Donate: "Donate",
};

export function ListingTab({ userId }: { userId?: string }) {
  const [filter, setFilter] = useState<ListingFilter>("All");

  const { data, isPending, isError, error, refetch } = useUserListings(
    userId,
    LISTING_TYPE_PARAMS[filter]
  );

  const displayed = data?.data ?? [];

  return (
    <div className="mt-4">
      <FilterPills
        options={["All", "Sell", "Swap", "Donate"] as ListingFilter[]}
        active={filter}
        onChange={setFilter}
      />

      {isPending ? (
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <QueryError error={error} onRetry={() => refetch()} className="mt-4" />
      ) : displayed.length === 0 ? (
        <div className="flex flex-col gap-4 items-center justify-center py-16">
          <Image
            src="/assets/images/all-listing-empty.png"
            alt="No listings"
            width={90}
            height={90}
          />

          <p className="text-sm md:text-base font-medium text-foreground">
            No Listed Items for now
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1">
          {displayed.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 p-2 rounded-lg bg-background hover:bg-gray-50 transition-colors"
            >
              <div className="flex gap-2 items-center flex-1 min-w-0">
                <div className="relative w-20 h-20 border-2  custom-shadow border-white rounded-lg bg-gray-100 shrink-0">
                  <Image
                    src={item.imageUrl || FALLBACK_IMAGE}
                    alt={item.title ?? "Listing"}
                    fill
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <p className="text-sm font-bold text-foreground truncate">
                    {item.title}
                  </p>
                  {item.listingType && (
                    <ListingTypeBadge type={item.listingType} />
                  )}
                  <p className="text-xs text-[#868686] font-medium">
                    Published {item.publishedTimeAgo}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0 flex flex-col justify-end">
                {item.price ? (
                  <p className="text-sm md:text-base font-extrabold mb-3 text-primary">
                    ₦{item.price.toLocaleString()}
                  </p>
                ) : null}
                <p className="text-xs text-[#868686] font-medium">
                  <IoEyeOutline className="inline size-3 md:size-4.5" />{" "}
                  {item.viewCount ?? 0} views
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
