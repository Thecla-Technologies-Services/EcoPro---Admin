"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function YearGrid({
  pageStart,
  onNavigatePage,
  selectedYear,
  onSelectYear,
}: {
  pageStart: number;
  onNavigatePage: (nextPageStart: number) => void;
  selectedYear: number;
  onSelectYear: (y: number) => void;
}) {
  const years = Array.from({ length: 9 }, (_, i) => pageStart + i);

  return (
    <div className="w-70 select-none">
      <div className="flex items-center justify-between px-1 pb-3">
        <button
          type="button"
          onClick={() => onNavigatePage(pageStart - 9)}
          className="rounded p-1 text-muted-foreground hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {years[0]} - {years[years.length - 1]}
        </span>
        <button
          type="button"
          onClick={() => onNavigatePage(pageStart + 9)}
          className="rounded p-1 text-muted-foreground hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => onSelectYear(y)}
            className={cn(
              "rounded-md py-2 text-sm transition-colors",
              y === selectedYear
                ? "bg-emerald-600 text-white font-medium"
                : "hover:bg-muted",
            )}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}
