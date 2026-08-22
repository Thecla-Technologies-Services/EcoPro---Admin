import type { RangeType, DateRange } from "@/types/date";
import { MONTH_SHORT, MONTH_LONG } from "@/constants/date";

/**
 * Calendar arithmetic over native `Date`s, for the date-range picker.
 *
 * Everything here works in local time on whole days — `stripTime` is applied on
 * the way in — because the picker compares what a person clicked against what a
 * cell shows. Formatting an API timestamp for a table row is a different job,
 * and lives in `lib/adapters/shared.ts`.
 */

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function stripTime(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startOfWeek(d: Date) {
  const s = stripTime(d);
  s.setDate(s.getDate() - s.getDay());
  return s;
}

export function endOfWeek(d: Date) {
  const s = startOfWeek(d);
  return addDays(s, 6);
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}

export function addDays(d: Date, n: number) {
  const r = stripTime(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function isInRange(d: Date, from: Date, to: Date) {
  const t = stripTime(d).getTime();
  return t >= stripTime(from).getTime() && t <= stripTime(to).getTime();
}

export function computeRange(
  type: RangeType,
  anchor: Date,
  customFrom?: Date,
  customTo?: Date,
): DateRange {
  switch (type) {
    case "day":
      return { from: stripTime(anchor), to: stripTime(anchor) };
    case "week":
      return { from: startOfWeek(anchor), to: stripTime(anchor) };
    case "month":
      return { from: startOfMonth(anchor), to: stripTime(anchor) };
    case "year":
      return { from: startOfYear(anchor), to: stripTime(anchor) };
    case "custom":
      return {
        from: stripTime(customFrom ?? anchor),
        to: stripTime(customTo ?? customFrom ?? anchor),
      };
  }
}

/**
 * A `Date` as the picker labels it: `Mar 4, 2026`.
 *
 * Named for the label rather than the operation because `lib/adapters/shared.ts`
 * exports a `formatDate` too — that one takes an API timestamp string and
 * renders `04 Mar 2026` for a table row. Two different jobs; two names.
 */
export function formatDayLabel(d: Date) {
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatRangeLabel(type: RangeType, range: DateRange) {
  switch (type) {
    case "day":
      return formatDayLabel(range.from);
    case "month":
      return `${MONTH_LONG[range.from.getMonth()]} ${range.from.getFullYear()}`;
    case "year":
      return `${range.from.getFullYear()}`;
    default:
      return `${formatDayLabel(range.from)} - ${formatDayLabel(range.to)}`;
  }
}

/**
 * A chat message's time as the transcript reads it: the clock time for today,
 * "Yesterday", then a day count.
 */
export function formatTimestamp(input: Date | string): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 24) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}
