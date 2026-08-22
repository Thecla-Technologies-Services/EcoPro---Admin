"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTH_LONG, WEEKDAY_SHORT } from "@/constants/date";
import { isInRange, sameDay, addMonths, daysInMonth } from "@/lib/date";

import { cn } from "@/lib/utils";

export function DayGrid({
  viewDate,
  onNavigate,
  rangeFrom,
  rangeTo,
  onSelectDay,
}: {
  viewDate: Date;
  onNavigate: (next: Date) => void;
  rangeFrom?: Date;
  rangeTo?: Date;
  onSelectDay: (d: Date) => void;
}) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const totalDays = daysInMonth(year, month);
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  return (
    <div className="w-70 select-none">
      <div className="flex items-center justify-between px-1 pb-3">
        <button
          type="button"
          onClick={() => onNavigate(addMonths(viewDate, -1))}
          className="rounded p-1 text-muted-foreground hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium">
          {MONTH_LONG[month]} {year}
        </span>
        <button
          type="button"
          onClick={() => onNavigate(addMonths(viewDate, 1))}
          className="rounded p-1 text-muted-foreground hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {WEEKDAY_SHORT.map((w) => (
          <span key={w} className="text-xs font-medium text-muted-foreground">
            {w}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`blank-${i}`} />;
          const date = new Date(year, month, day);
          const isSelected =
            (rangeFrom && sameDay(date, rangeFrom)) ||
            (rangeTo && sameDay(date, rangeTo));
          const inRange =
            rangeFrom && rangeTo && isInRange(date, rangeFrom, rangeTo);

          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(date)}
              className={cn(
                "mx-auto flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
                isSelected && "bg-emerald-600 text-white font-medium",
                !isSelected && inRange && "bg-emerald-100 text-emerald-900",
                !isSelected && !inRange && "hover:bg-muted",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
