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
import { PageHeader } from "@/components/shared/page-header";
import { StatGrid } from "@/components/shared/stat-grid";
import { DataState } from "@/components/shared/data-state";
import { FilterTabs } from "@/components/shared/filter-tabs";
import { Toolbar } from "@/components/shared/toolbar";
import { SimpleSelect } from "@/components/shared/simple-select";
import { useListings } from "@/hooks/admin/use-listings";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { cn } from "@/lib/utils";
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

const PAGE_SIZE = 10;

export default function ListingsPage() {
  const [tab, setTab] = useState<ListingTab>("all");
  const [country, setCountry] = useState<CountryFilter>(ALL_COUNTRIES);
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
      country: toCountryParam(country),
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

  return (
    <div className="space-y-6 w-full overflow-x-hidden">
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

      <Toolbar>
        <Toolbar.Start>
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

          {/* Sits in the tab row and borrows the tab styling: it filters the
              same list, and a country picked reads as an active filter. */}
          <SimpleSelect
            options={COUNTRY_FILTER_OPTIONS}
            value={country}
            onValueChange={changeCountry}
            aria-label="Filter by country"
            className={cn(
              "w-auto gap-2 rounded-md border-transparent px-4 py-3 text-sm font-medium transition-all h-auto data-[size=default]:h-auto",
              country === ALL_COUNTRIES
                ? "bg-[#F2F2F2] text-gray-500 hover:bg-gray-200"
                : "bg-primary/7 text-primary",
            )}
          />
        </Toolbar.Start>
        <Toolbar.End>
          <SearchDropDown
            placeholder="Search listings..."
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
