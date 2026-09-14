"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { IoEyeOutline } from "react-icons/io5";
import { FilterPills, ListingTypeBadge } from "./pills";
import { DataState } from "@/components/shared/data-state";
import { Pagination } from "@/components/shared/pagination";
import { pageSlice } from "@/lib/paging";
import { useUserListings } from "@/hooks/admin/use-users";
import type { ListingFilter } from "@/types/user";
import { Amount } from "@/components/shared/amount";

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

const PAGE_SIZE = 4;

export function ListingTab({ userId }: { userId?: string }) {
  const [filter, setFilter] = useState<ListingFilter>("All");
  const [pageNumber, setPageNumber] = useState(1);
  // Anchors paging to the scrolling list below, inside the sheet body.
  const listRef = useRef<HTMLDivElement>(null);

  const { data, isPending, isFetching, isError, error, refetch } =
    useUserListings(userId, LISTING_TYPE_PARAMS[filter], {
      pageNumber,
      pageSize: PAGE_SIZE,
    });

  const {
    rows: displayed,
    pageCount,
    totalCount,
  } = pageSlice(data, pageNumber, PAGE_SIZE);

  return (
    <div ref={listRef} className="mt-4">
      <FilterPills
        options={["All", "Sell", "Swap", "Donate"] as ListingFilter[]}
        active={filter}
        onChange={(next) => {
          setFilter(next);
          setPageNumber(1);
        }}
      />

      <DataState>
        <DataState.Error
          when={isError}
          error={error}
          onRetry={() => refetch()}
          className="mt-4"
        />
        <DataState.Loading
          when={isPending}
          rows={3}
          rowClassName="h-24 rounded-lg"
          className="mt-4"
        />
        <DataState.Empty when={displayed.length === 0}>
          <div className="flex flex-col gap-4 items-center justify-center">
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
        </DataState.Empty>
        <DataState.Content
          busy={isFetching}
          className="mt-4 space-y-3"
        >
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
                    <Amount amount={item.price} />
                  </p>
                ) : null}
                <p className="text-xs text-[#868686] font-medium">
                  <IoEyeOutline className="inline size-3 md:size-4.5" />{" "}
                  {item.viewCount ?? 0} views
                </p>
              </div>
            </div>
          ))}
        </DataState.Content>
      </DataState>

      {pageCount > 1 && (
        <Pagination
          current={pageNumber}
          total={pageCount}
          onChange={setPageNumber}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
          rowsOnPage={displayed.length}
          rowLabel="listings"
          scrollAnchorRef={listRef}
        />
      )}
    </div>
  );
}
