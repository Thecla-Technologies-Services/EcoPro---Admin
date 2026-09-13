/**
 * Almost every admin list endpoint accepts the same pagination, search, sort
 * and scope filters. This models that shared set once.
 *
 * A filter only two endpoints take stays out of here — the listing type is the
 * example, and the two spell it differently, so each hook sends its own.
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
  /** A `UserType` value — `EcoWarrior`, `CharityPartner`, `LogisticsPartner`, `IndependentRider` or `Admin`. */
  role?: string;
  /** Drops staff accounts from a users list server-side. */
  excludeAdmins?: boolean;
}

/**
 * The platform listings endpoint's scope: the shared filters plus the type,
 * which only it and the per-user listings endpoint accept — and which the two
 * spell differently, so each hook sends its own.
 *
 * Named rather than inlined because the query key is built from the same shape:
 * a key typed to the narrower set would read as though the listing type does
 * not vary the cache, when it does.
 */
export interface ListingQueryFilters extends AdminQueryFilters {
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

export type FormFieldValue = QueryParamValue | File | File[];

/**
 * Serialises fields into a multipart body for the endpoints that take one.
 *
 * Same rule as `buildQueryString`: an empty field is left out rather than sent
 * as an empty string, because a multipart PUT treats a field it received as a
 * field the admin meant to clear. An array appends one entry per file under the
 * same name, which is how the API models `Documents` and `NewDocuments`.
 */
export function buildFormData(
  fields: Record<string, FormFieldValue>
): FormData {
  const form = new FormData();

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      for (const file of value) form.append(key, file);
      continue;
    }

    form.append(key, value instanceof File ? value : String(value));
  }

  return form;
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
    Role: filters.role,
    ExcludeAdmins: filters.excludeAdmins,
  };
}
