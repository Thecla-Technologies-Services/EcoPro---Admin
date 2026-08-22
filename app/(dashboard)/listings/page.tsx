"use client";
import { useMemo, useState } from "react";
import { Plus, Package, Box } from "lucide-react";
import { SearchDropDown } from "@/components/shared/search-dropdown";
import { DateRangeFilter } from "@/components/shared/date-range-filter";
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
import { SimpleSelect } from "@/components/shared/simple-select";
import { useListings } from "@/hooks/admin/use-listings";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
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
  const [tab, setTab] = useState<ListingTab>("all");
  const [country, setCountry] = useState<CountryFilter>(ALL_COUNTRIES);
  const [listingType, setListingType] =
    useState<ListingTypeFilter>(ALL_LISTING_TYPES);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateRangeFilterValue>();

  const debouncedSearch = useDebouncedValue(search);

  const { data, isPending, isFetching, isError, error, refetch } = useListings(
    LISTING_TAB_PARAMS[tab],
    {
      pageNumber: page,
      pageSize: PAGE_SIZE,
      searchTerm: debouncedSearch || undefined,
      country: toCountryParam(country),
      listingType: toListingTypeParam(listingType),
      // The endpoint types both bounds as date-time, so the range is sent as
      // full ISO timestamps rather than bare dates.
      fromDate: dateFilter?.range.from.toISOString(),
      toDate: dateFilter?.range.to.toISOString(),
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

  // A narrower or wider country invalidates the current page position.
  const changeCountry = (next: string) => {
    setCountry(next as CountryFilter);
    setPage(1);
  };

  const changeListingType = (next: string) => {
    setListingType(next as ListingTypeFilter);
    setPage(1);
  };

  const changeDateFilter = (next: DateRangeFilterValue) => {
    setDateFilter(next);
    setPage(1);
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
            isLoading={isPending}
            value={metrics?.totalListings ?? 0}
            icon={IoCartOutline}
          />
          <SharedStatCard
            label="Active Listings"
            isLoading={isPending}
            value={metrics?.activeListings ?? 0}
            icon={Package}
          />
          <SharedStatCard
            label="Pending Approval"
            isLoading={isPending}
            value={metrics?.pendingApproval ?? 0}
            icon={Box}
          />
          <SharedStatCard
            label="Flagged Items"
            isLoading={isPending}
            value={metrics?.flaggedItems ?? 0}
            icon={HiOutlineDocumentCheck}
          />
        </StatGrid>

        <Toolbar className="gap-3">
          <Toolbar.Start className="w-full md:w-auto">
            <FilterTabs value={tab} onChange={(next) => changeTab(next as ListingTab)}>
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
              value={country}
              onValueChange={changeCountry}
              aria-label="Filter by country"
              className={filterSelectClass(country === ALL_COUNTRIES)}
            />

            <SimpleSelect
              options={LISTING_TYPE_FILTER_OPTIONS}
              value={listingType}
              onValueChange={changeListingType}
              aria-label="Filter by listing type"
              className={filterSelectClass(listingType === ALL_LISTING_TYPES)}
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
                setSearch(query);
                setPage(1);
              }}
            />
          </Toolbar.End>
        </Toolbar>

        <DataState>
          <DataState.Error
            when={isError}
            error={error}
            onRetry={() => refetch()}
          />
          <DataState.Loading
            when={isPending}
            rows={4}
            rowClassName="h-44 rounded-md"
          />
          <DataState.Empty when={listings.length === 0}>
            No listings found.
          </DataState.Empty>
          <DataState.Content busy={isFetching} className="space-y-3">
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
          <Pagination
            current={page}
            total={pageData?.totalPages ?? 1}
            onChange={setPage}
            totalCount={pageData?.totalRecords}
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
