"use client";
import { useState } from "react";
import { Plus, Package, Box } from "lucide-react";
import { SearchDropDown } from "@/components/shared/form/search-dropdown";
import { DateRangeFilter } from "@/components/shared/date/date-range-filter";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/shared/pagination";
import { ListingFormDialog } from "@/components/dashboard/listings/listing-form";
import ListingRow from "@/components/dashboard/listings/listing-row";
import { IoCartOutline } from "react-icons/io5";
import { HiOutlineDocumentCheck } from "react-icons/hi2";
import SharedStatCard from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid } from "@/components/shared/stat-grid";
import { DataState } from "@/components/shared/data-state";
import { FilterTabs } from "@/components/shared/filter-tabs";
import { Toolbar } from "@/components/shared/toolbar";
import { SimpleSelect } from "@/components/shared/form/simple-select";
import { useListings } from "@/hooks/admin/use-listings";
import { useListPanel } from "@/hooks/shared/use-list-panel";
import type { AdminListingMetricsDto } from "@/types/api/admin";
import { cn } from "@/lib/utils";
import type { DateRangeFilterValue } from "@/types/date";
import {
  LISTING_TAB_PARAMS,
  toListingRow,
  type ListingTab,
} from "@/lib/adapters/listing";
import {
  ALL_COUNTRIES,
  COUNTRY_FILTER_OPTIONS,
  toCountryParam,
  type CountryFilter,
} from "@/constants/country";
import {
  ALL_LISTING_TYPES,
  LISTING_TYPE_FILTER_OPTIONS,
  toListingTypeParam,
  type ListingTypeFilter,
} from "@/constants/listing-type";

const PAGE_SIZE = 10;

/**
 * The toolbar dropdowns borrow the filter-tab styling: they filter the same
 * list, and a value picked reads as an active filter.
 */
function filterSelectClass(unfiltered: boolean) {
  return cn(
    "w-auto gap-2 rounded-md border-transparent px-4 py-3 text-sm font-medium transition-all h-auto data-[size=default]:h-auto",
    unfiltered
      ? "bg-[#F2F2F2] text-gray-500 hover:bg-gray-200"
      : "bg-primary/7 text-primary",
  );
}

export default function ListingsPage() {
  const [addOpen, setAddOpen] = useState(false);
  /**
   * The picker deals in `Date`s and the panel's filters in strings, so the
   * chosen range is kept here for the trigger's label and sent to the API as
   * two ISO timestamps.
   */
  const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>();

  const panel = useListPanel({
    pageSize: PAGE_SIZE,
    initialFilters: {
      tab: "all",
      country: ALL_COUNTRIES,
      listingType: ALL_LISTING_TYPES,
    },
    useQuery: ({ pagination, search, filters }) => {
      const query = useListings(
        LISTING_TAB_PARAMS[(filters.tab ?? "all") as ListingTab],
        {
          // The API pages from 1; the panel indexes from 0.
          pageNumber: pagination.pageIndex + 1,
          pageSize: pagination.pageSize,
          searchTerm: search || undefined,
          country: toCountryParam(filters.country as CountryFilter),
          listingType: toListingTypeParam(
            filters.listingType as ListingTypeFilter,
          ),
          fromDate: filters.fromDate,
          toDate: filters.toDate,
        },
      );

      const page = query.data?.listings;

      return {
        rows: page?.data ?? [],
        meta: query.data?.metrics,
        totalPages: page?.totalPages,
        totalCount: page?.totalRecords,
        isPending: query.isPending,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
        refetch: () => void query.refetch(),
      };
    },
    toRow: toListingRow,
  });

  const listings = panel.rows;
  const metrics: AdminListingMetricsDto | undefined = panel.meta;
  const { setFilter } = panel;

  const changeDateFilter = (next: DateRangeFilterValue) => {
    setDateFilter(next);
    // The endpoint types both bounds as date-time, so the range is sent as
    // full ISO timestamps rather than bare dates.
    setFilter("fromDate", next.range.from.toISOString());
    setFilter("toDate", next.range.to.toISOString());
  };

  return (
    // Fills `main` exactly, so the rows scroll in their own box and the
    // pagination below is simply outside that box — no sticky offsets to fight
    // with `main`'s padding.
    <div className="flex h-full w-full flex-col">
      <div className="scrollbar-hide min-h-0 flex-1 space-y-6 overflow-y-auto pb-8">
        <PageHeader>
          <PageHeader.Heading className="gap-0.5">
            <PageHeader.Title className="font-semibold">
              Listings
            </PageHeader.Title>
            <PageHeader.Description>
              Review, approve, and manage all platform listings
            </PageHeader.Description>
          </PageHeader.Heading>
          <PageHeader.Actions>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4 gap-1.5"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="size-4" />
              Add Listing
            </Button>
          </PageHeader.Actions>
        </PageHeader>

        <StatGrid className="mb-7">
          <SharedStatCard
            label="Total Listings"
            isLoading={panel.query.isPending}
            value={metrics?.totalListings ?? 0}
            icon={IoCartOutline}
          />
          <SharedStatCard
            label="Active Listings"
            isLoading={panel.query.isPending}
            value={metrics?.activeListings ?? 0}
            icon={Package}
          />
          <SharedStatCard
            label="Pending Approval"
            isLoading={panel.query.isPending}
            value={metrics?.pendingApproval ?? 0}
            icon={Box}
          />
          <SharedStatCard
            label="Flagged Items"
            isLoading={panel.query.isPending}
            value={metrics?.flaggedItems ?? 0}
            icon={HiOutlineDocumentCheck}
          />
        </StatGrid>

        <Toolbar className="gap-3">
          <Toolbar.Start className="w-full md:w-auto">
            <FilterTabs
              value={panel.table.activeTab}
              onChange={panel.table.onTabChange}
            >
              <FilterTabs.Tab value="all">All Listings</FilterTabs.Tab>
              <FilterTabs.Tab value="active" count={metrics?.activeListings ?? 0}>
                Active
              </FilterTabs.Tab>
              <FilterTabs.Tab
                value="flagged"
                count={metrics?.flaggedItems ?? 0}
                flagged
              >
                Flagged
              </FilterTabs.Tab>
            </FilterTabs>

            <SimpleSelect
              options={COUNTRY_FILTER_OPTIONS}
              value={panel.filters.country}
              onValueChange={(next) => setFilter("country", next)}
              aria-label="Filter by country"
              className={filterSelectClass(panel.filters.country === ALL_COUNTRIES)}
            />

            <SimpleSelect
              options={LISTING_TYPE_FILTER_OPTIONS}
              value={panel.filters.listingType}
              onValueChange={(next) => setFilter("listingType", next)}
              aria-label="Filter by listing type"
              className={filterSelectClass(
                panel.filters.listingType === ALL_LISTING_TYPES,
              )}
            />
          </Toolbar.Start>
          {/* Dropping the shared `ml-auto` leaves the alignment to the
              toolbar's own `justify-between`: on a shared row that still pushes
              these to the right, but a row they wrap onto holds a single item,
              which lands at the start instead of stranded on the far edge.
              Below md they stretch and wrap onto separate lines. */}
          <Toolbar.End className="w-full flex-wrap md:ml-0 md:w-auto">
            <DateRangeFilter
              value={dateFilter}
              onChange={changeDateFilter}
              className="w-full justify-between sm:w-auto sm:min-w-40 sm:flex-1 md:flex-none md:justify-center"
            />
            <SearchDropDown
              placeholder="Search listings..."
              className="w-full sm:w-auto sm:min-w-40 sm:flex-1 md:w-56 md:flex-none"
              onSearch={(query) => {
                panel.table.onSearchChange(query);
              }}
            />
          </Toolbar.End>
        </Toolbar>

        <DataState>
          <DataState.Error
            when={panel.query.isError}
            error={panel.query.error}
            onRetry={panel.query.refetch}
          />
          <DataState.Loading
            when={panel.query.isPending}
            rows={4}
            rowClassName="h-44 rounded-md"
          />
          <DataState.Empty when={listings.length === 0}>
            No listings found.
          </DataState.Empty>
          <DataState.Content busy={panel.table.isLoading} className="space-y-3">
            {listings.map((listing) => (
              <ListingRow key={listing.id} listing={listing} />
            ))}
          </DataState.Content>
        </DataState>
      </div>

      {/* Footer — outside the scroll box, so it holds the bottom of the page
          while everything above it scrolls. It stays within `main`'s padding
          and aligned with the rows, as the design has it: bleeding it to the
          window edge with negative margins makes this element wider than its
          container, which overflows the page sideways and clips the header. */}
      {listings.length > 0 && (
        <div className="shrink-0 border-t border-border bg-white pt-4">
          {/* The panel indexes from 0, this control counts from 1. */}
          <Pagination
            current={panel.table.pagination.pageIndex + 1}
            total={panel.table.totalPages ?? 1}
            onChange={(next) =>
              panel.table.onPaginationChange({
                ...panel.table.pagination,
                pageIndex: next - 1,
              })
            }
            totalCount={panel.table.totalCount}
            pageSize={PAGE_SIZE}
            rowsOnPage={listings.length}
            rowLabel="listings"
          />
        </div>
      )}

      {/* Add listing dialog */}
      <ListingFormDialog open={addOpen} onOpenChange={setAddOpen} mode="add" />
    </div>
  );
}
