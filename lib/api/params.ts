/**
 * Almost every admin list endpoint accepts the same pagination, search, sort
 * and scope filters. This models that shared set once.
 */
export interface AdminQueryFilters {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  sortBy?: string;
  isAscending?: boolean;
  /** ISO date string. */
  fromDate?: string;
  /** ISO date string. */
  toDate?: string;
  country?: string;
  state?: string;
  /**
   * Not yet a documented parameter on any list endpoint — see the note in
   * `paginationParams`.
   */
  listingType?: string;
}

export type QueryParamValue = string | number | boolean | null | undefined;

/**
 * Serialises params into a query string, dropping empties so an unset filter
 * never reaches the API as `SearchTerm=`.
 */
export function buildQueryString(params: Record<string, QueryParamValue>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

/** Maps the shared filters onto the parameter names the API expects. */
export function paginationParams(
  filters: AdminQueryFilters = {}
): Record<string, QueryParamValue> {
  return {
    PageNumber: filters.pageNumber,
    PageSize: filters.pageSize,
    SearchTerm: filters.searchTerm,
    SortBy: filters.sortBy,
    IsAscending: filters.isAscending,
    FromDate: filters.fromDate,
    ToDate: filters.toDate,
    Country: filters.country,
    State: filters.state,
    // The listings endpoint does not document a type filter, so this is sent
    // ahead of the API supporting it; an unrecognised parameter comes back as
    // an unfiltered list rather than an error.
    ListingType: filters.listingType,
  };
}
