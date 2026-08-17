"use client";

import * as React from "react";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { DayGrid } from "./day-grid";
import { MonthGrid } from "./month-grid";
import { YearGrid } from "./year-grid";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DEFAULT_TODAY } from "@/constants/date";
import {
  formatRangeLabel,
  startOfMonth,
  startOfWeek,
  addMonths,
  endOfWeek,
  computeRange,
  formatDate,
} from "@/lib/helper";
import { Label } from "@/components/ui/label";
import type {
  RangeType,
  DateRangeFilterValue,
  DateRangeFilterProps,
} from "@/types/date";
import { cn } from "@/lib/utils";

export function DateRangeFilter({
  value,
  onChange,
  className,
}: DateRangeFilterProps) {
  const [open, setOpen] = React.useState(false);

  const initialValue: DateRangeFilterValue = value ?? {
    type: "week",
    range: computeRange("week", DEFAULT_TODAY),
  };

  const [applied, setApplied] =
    React.useState<DateRangeFilterValue>(initialValue);

  // Pending (uncommitted) selection state, reset each time the popover opens.
  const [pendingType, setPendingType] = React.useState<RangeType>(applied.type);
  const [anchor, setAnchor] = React.useState<Date>(applied.range.to);
  const [customFrom, setCustomFrom] = React.useState<Date | undefined>(
    applied.type === "custom" ? applied.range.from : undefined,
  );
  const [customTo, setCustomTo] = React.useState<Date | undefined>(
    applied.type === "custom" ? applied.range.to : undefined,
  );
  const [pickingCustomTo, setPickingCustomTo] = React.useState(false);

  // View cursors for each calendar mode.
  const [dayViewMonth, setDayViewMonth] = React.useState<Date>(
    startOfMonth(anchor),
  );
  const [monthViewYear, setMonthViewYear] = React.useState<number>(
    anchor.getFullYear(),
  );
  const [yearViewPageStart, setYearViewPageStart] = React.useState<number>(
    anchor.getFullYear() - 4,
  );
  const [customLeftMonth, setCustomLeftMonth] = React.useState<Date>(
    startOfMonth(anchor),
  );
  const [customRightMonth, setCustomRightMonth] = React.useState<Date>(
    addMonths(startOfMonth(anchor), 1),
  );

  function resetPendingFromApplied() {
    setPendingType(applied.type);
    setAnchor(applied.range.to);
    setPickingCustomTo(false);
    if (applied.type === "custom") {
      setCustomFrom(applied.range.from);
      setCustomTo(applied.range.to);
      setCustomLeftMonth(startOfMonth(applied.range.from));
      setCustomRightMonth(startOfMonth(applied.range.to));
    } else {
      setCustomFrom(undefined);
      setCustomTo(undefined);
    }
    setDayViewMonth(startOfMonth(applied.range.to));
    setMonthViewYear(applied.range.to.getFullYear());
    setYearViewPageStart(applied.range.to.getFullYear() - 4);
  }

  const pendingRange = computeRange(pendingType, anchor, customFrom, customTo);

  function handleApply() {
    const next: DateRangeFilterValue = {
      type: pendingType,
      range: pendingRange,
    };
    setApplied(next);
    onChange?.(next);
    setOpen(false);
  }

  function handleCancel() {
    setOpen(false);
  }

  function handleCustomDayClick(d: Date) {
    if (!pickingCustomTo || !customFrom) {
      setCustomFrom(d);
      setCustomTo(undefined);
      setPickingCustomTo(true);
      return;
    }
    if (d.getTime() < customFrom.getTime()) {
      setCustomTo(customFrom);
      setCustomFrom(d);
    } else {
      setCustomTo(d);
    }
    setPickingCustomTo(false);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) resetPendingFromApplied();
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("h-9 gap-2 rounded-full font-normal", className)}
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>{formatRangeLabel(applied.type, applied.range)}</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>

      {/* key remounts the whole panel on open so internal state never leaks stale values */}
      <PopoverContent
        key={String(open)}
        className="w-auto h-full p-0"
        align="start"
      >
        <div className="flex md:flex-row flex-col">
          {/* Left: options panel */}
          <div className="w-full md:w-55 md:border-r p-3 md:p-4">
            <p className="mb-3 text-xs font-medium text-muted-foreground">
              Range
            </p>
            <RadioGroup
              value={pendingType}
              onValueChange={(v: string) => setPendingType(v as RangeType)}
              className="gap-3"
            >
              {(
                [
                  ["day", "This Day"],
                  ["week", "This Week"],
                  ["month", "This Month"],
                  ["year", "This Year"],
                  ["custom", "Custom Range"],
                ] as [RangeType, string][]
              ).map(([val, label]) => (
                <div key={val} className="flex items-center gap-2">
                  <RadioGroupItem value={val} id={`range-${val}`} />
                  <Label
                    htmlFor={`range-${val}`}
                    className="cursor-pointer font-normal"
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="mt-4">
              {pendingType === "custom" ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1.5 text-sm">
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {customFrom ? formatDate(customFrom) : "Start date"}
                  </div>
                  <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1.5 text-sm">
                    <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    {customTo ? formatDate(customTo) : "End date"}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-2 py-1.5 text-sm">
                  <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatRangeLabel(pendingType, pendingRange)}
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-primary hover:bg-emerald-700"
                onClick={handleApply}
              >
                Apply
              </Button>
            </div>
          </div>

          {/* Right: calendar panel */}
          <div className="p-3 md:p-4">
            {pendingType === "day" && (
              <DayGrid
                viewDate={dayViewMonth}
                onNavigate={setDayViewMonth}
                rangeFrom={anchor}
                rangeTo={anchor}
                onSelectDay={(d) => setAnchor(d)}
              />
            )}

            {pendingType === "week" && (
              <DayGrid
                viewDate={dayViewMonth}
                onNavigate={setDayViewMonth}
                rangeFrom={startOfWeek(anchor)}
                rangeTo={endOfWeek(anchor)}
                onSelectDay={(d) => setAnchor(d)}
              />
            )}

            {pendingType === "month" && (
              <MonthGrid
                year={monthViewYear}
                onNavigateYear={setMonthViewYear}
                selectedMonth={anchor.getMonth()}
                onSelectMonth={(m) => setAnchor(new Date(monthViewYear, m, 1))}
              />
            )}

            {pendingType === "year" && (
              <YearGrid
                pageStart={yearViewPageStart}
                onNavigatePage={setYearViewPageStart}
                selectedYear={anchor.getFullYear()}
                onSelectYear={(y) =>
                  setAnchor(new Date(y, anchor.getMonth(), 1))
                }
              />
            )}

            {pendingType === "custom" && (
              <div className="flex flex-col md:flex-row gap-4">
                <DayGrid
                  viewDate={customLeftMonth}
                  onNavigate={setCustomLeftMonth}
                  rangeFrom={customFrom}
                  rangeTo={customTo}
                  onSelectDay={handleCustomDayClick}
                />
                <DayGrid
                  viewDate={customRightMonth}
                  onNavigate={setCustomRightMonth}
                  rangeFrom={customFrom}
                  rangeTo={customTo}
                  onSelectDay={handleCustomDayClick}
                />
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default DateRangeFilter;
