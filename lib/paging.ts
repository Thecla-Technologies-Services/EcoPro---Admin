/** The paging envelope every Admin list endpoint answers with. */
export interface PagedResponse<T> {
  data?: T[] | null;
  totalPages?: number;
  totalRecords?: number;
}

export interface PageSlice<T> {
  rows: T[];
  /** 0 when there is nothing to page through, so a caller can hide controls. */
  pageCount: number;
  totalCount: number;
}

/**
 * The rows belonging on `pageNumber`, whether the endpoint paged them or not.
 *
 * Some Admin endpoints accept `PageNumber`/`PageSize` and answer with one
 * page; others ignore both and answer with the whole list and a `totalPages`
 * of 1. Reading either as the truth gets one of them wrong — trusting the
 * envelope hides the controls over a list that has more, and slicing blindly
 * throws away every page but the first of a list the server already paged.
 *
 * So the response itself says which happened: more rows than a page holds can
 * only mean the parameters were ignored, and those rows are sliced here. A
 * response that fits in a page is passed through as the server sent it.
 */
export function pageSlice<T>(
  response: PagedResponse<T> | undefined,
  pageNumber: number,
  pageSize: number,
): PageSlice<T> {
  const rows = response?.data ?? [];

  if (rows.length > pageSize) {
    const start = (pageNumber - 1) * pageSize;
    return {
      rows: rows.slice(start, start + pageSize),
      pageCount: Math.ceil(rows.length / pageSize),
      totalCount: rows.length,
    };
  }

  // `totalRecords` is the more reliable of the two: an endpoint that reports a
  // count but no page count still has enough to derive one.
  const totalCount = response?.totalRecords ?? rows.length;

  return {
    rows,
    pageCount: response?.totalPages ?? Math.ceil(totalCount / pageSize),
    totalCount,
  };
}
