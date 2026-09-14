import { describe, expect, it } from "vitest";
import { pageSlice } from "./paging";

const rows = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

describe("pageSlice", () => {
  it("passes through a page the server already sliced", () => {
    const result = pageSlice(
      { data: rows(5), totalPages: 4, totalRecords: 18 },
      2,
      5,
    );

    expect(result).toEqual({ rows: rows(5), pageCount: 4, totalCount: 18 });
  });

  it("slices in memory when the endpoint ignored the paging parameters", () => {
    const result = pageSlice(
      { data: rows(18), totalPages: 1, totalRecords: 18 },
      2,
      5,
    );

    expect(result).toEqual({ rows: [6, 7, 8, 9, 10], pageCount: 4, totalCount: 18 });
  });

  it("derives a page count from the record count when totalPages is absent", () => {
    expect(pageSlice({ data: rows(5), totalRecords: 12 }, 1, 5).pageCount).toBe(3);
  });

  it("reports no pages for an empty or missing response", () => {
    expect(pageSlice(undefined, 1, 5)).toEqual({ rows: [], pageCount: 0, totalCount: 0 });
    expect(pageSlice({ data: [] }, 1, 5).pageCount).toBe(0);
  });
});
