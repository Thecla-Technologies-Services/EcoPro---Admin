"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { MONTH_SHORT } from "@/constants/date";

import { cn } from "@/lib/utils";

export function MonthGrid({
  year,
  onNavigateYear,
  selectedMonth,
  onSelectMonth,
}: {
  year: number;
  onNavigateYear: (nextYear: number) => void;
  selectedMonth: number;
  onSelectMonth: (m: number) => void;
}) {
  return (
    <div className="w-70 select-none">
      <div className="flex items-center justify-between px-1 pb-3">
        <button
          type="button"
          onClick={() => onNavigateYear(year - 1)}
          className="rounded p-1 text-muted-foreground hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">{year}</span>
        <button
          type="button"
          onClick={() => onNavigateYear(year + 1)}
          className="rounded p-1 text-muted-foreground hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {MONTH_SHORT.map((m, i) => (
          <button
            key={m}
            type="button"
            onClick={() => onSelectMonth(i)}
            className={cn(
              "rounded-md py-2 text-sm transition-colors",
              i === selectedMonth
                ? "bg-emerald-600 text-white font-medium"
                : "hover:bg-muted",
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
