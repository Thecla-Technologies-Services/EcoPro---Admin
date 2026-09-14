"use client";

import { Button } from "@/components/ui/button";
import { ChevronDown, Upload } from "lucide-react";
import { PiFileCsv } from "react-icons/pi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateRangeFilter } from "./date-range-filter";
import { TableSearchInput } from "@/components/shared/table-search-input";
import { DateRangeFilterValue } from "@/types/date";

/**
 * The band at the right of a table header: Export, the date range, and search.
 *
 * One component rather than three at each call site, so every table that offers
 * them offers the same three pills in the same order.
 *
 * `search` and `onExport` are required: an unwired search box or a menu entry
 * that downloads nothing looks identical to a working one, so a table that
 * cannot supply them has to say so here rather than render the control anyway.
 */
export default function TableDateFilter({
  selected,
  setSelected,
  search,
  onSearchChange,
  onExport,
  searchPlaceholder = "Search",
}: {
  selected: DateRangeFilterValue | undefined;
  setSelected: (value: DateRangeFilterValue | undefined) => void;
  search: string;
  onSearchChange: (value: string) => void;
  /** Saves what the table is showing. See `downloadTableCsv`. */
  onExport: () => void;
  searchPlaceholder?: string;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-9 gap-2 rounded-full font-normal"
          >
            <Upload className="h-4 w-4 text-gray-400" />
            Export
            {/* The pill's own open state: a fill would read as "selected",
                which none of these three controls are. */}
            <ChevronDown
              className="h-4 w-4 text-gray-400 transition-transform group-data-[state=open]/button:rotate-180"
            />
          </Button>
        </DropdownMenuTrigger>
        {/* CSV alone: nothing here can write an xlsx, and an Excel entry that
            saved comma-separated text would produce a file Excel refuses. */}
        <DropdownMenuContent align="end" className="w-40 p-1">
          <DropdownMenuItem
            className="flex cursor-pointer items-center gap-2 text-sm"
            onClick={onExport}
          >
            <PiFileCsv className="size-6! text-foreground" />
            <p className="text-sm font-medium text-foreground">CSV</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DateRangeFilter value={selected} onChange={setSelected} />

      <TableSearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={searchPlaceholder}
        className="mt-0 w-full md:mt-0 md:w-50"
      />
    </div>
  );
}
