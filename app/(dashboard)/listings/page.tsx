"use client";
import { useMemo, useState } from "react";
import { Plus, Package, Box } from "lucide-react";
import { SearchDropDown } from "@/components/shared/search-dropdown";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { ListingFormDialog } from "@/components/dashboard/listings/listing-form";
import ListingRow from "@/components/dashboard/listings/listing-row";
import { IoCartOutline } from "react-icons/io5";
import { HiOutlineDocumentCheck } from "react-icons/hi2";
import SharedStatCard from "@/components/shared/stat-card";
import TabButton from "@/components/shared/tab-button";
import { FadeIn } from "@/components/motion/fade-in";
import { QueryError } from "@/components/shared/query-error";
import { Skeleton } from "@/components/ui/skeleton";
import { useListings } from "@/hooks/admin/use-listings";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  LISTING_TAB_PARAMS,
  toListingRow,
  type ListingTab,
} from "@/lib/adapters/listing";

const PAGE_SIZE = 10;

export default function ListingsPage() {
  const [tab, setTab] = useState<ListingTab>("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search);

  const { data, isPending, isFetching, isError, error, refetch } = useListings(
    LISTING_TAB_PARAMS[tab],
    {
      pageNumber: page,
      pageSize: PAGE_SIZE,
      searchTerm: debouncedSearch || undefined,
    }
  );

  const metrics = data?.metrics;
  const pageData = data?.listings;

  const listings = useMemo(
    () => (pageData?.data ?? []).map(toListingRow),
    [pageData?.data]
  );

  const changeTab = (next: ListingTab) => {
    setTab(next);
    setPage(1);
  };

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl md:text-[28px] font-semibold text-foreground">
            Listings
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review, approve, and manage all platform listings
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 gap-1.5"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="size-4" />
          Add Listing
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-7">
        <FadeIn delay={0.1}>
          <SharedStatCard
            label="Total Listings"
            value={metrics?.totalListings ?? 0}
            icon={IoCartOutline}
          />
        </FadeIn>

        <FadeIn delay={0.2}>
          <SharedStatCard
            label="Active Listings"
            value={metrics?.activeListings ?? 0}
            icon={Package}
          />
        </FadeIn>
        <FadeIn delay={0.3}>
          <SharedStatCard
            label="Pending Approval"
            value={metrics?.pendingApproval ?? 0}
            icon={Box}
          />
        </FadeIn>
        <FadeIn delay={0.4}>
          <SharedStatCard
            label="Flagged Items"
            value={metrics?.flaggedItems ?? 0}
            icon={HiOutlineDocumentCheck}
          />
        </FadeIn>
      </div>

      {/* Tab filters */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <TabButton active={tab === "all"} onClick={() => changeTab("all")}>
            All Listings
          </TabButton>
          <TabButton
            active={tab === "active"}
            onClick={() => changeTab("active")}
          >
            Active ({metrics?.activeListings ?? 0})
          </TabButton>
          <TabButton
            active={tab === "flagged"}
            flagged
            onClick={() => changeTab("flagged")}
          >
            Flagged ({metrics?.flaggedItems ?? 0})
          </TabButton>
        </div>

        <div>
          <SearchDropDown
            placeholder="Search listings..."
            onSearch={(query) => {
              setSearch(query);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* List */}
      {isError ? (
        <QueryError error={error} onRetry={() => refetch()} />
      ) : isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-44 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <div
          aria-busy={isFetching}
          className={
            isFetching ? "space-y-3 opacity-60 transition-opacity" : "space-y-3"
          }
        >
          {listings.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No listings found.
            </div>
          ) : (
            listings.map((listing) => (
              <ListingRow key={listing.id} listing={listing} />
            ))
          )}
        </div>
      )}

      {/* Footer */}
      {listings.length > 0 && (
        <Pagination
          current={page}
          total={pageData?.totalPages ?? 1}
          onChange={setPage}
          totalCount={pageData?.totalRecords}
          pageSize={PAGE_SIZE}
          rowsOnPage={listings.length}
          rowLabel="listings"
        />
      )}

      {/* Add listing dialog */}
      <ListingFormDialog open={addOpen} onOpenChange={setAddOpen} mode="add" />
    </div>
  );
}
