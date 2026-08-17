import { parsePhoneNumberFromString } from "libphonenumber-js";
import type { Country } from "react-phone-number-input";
import type { RangeType, DateRange } from "@/types/date";
import { MONTH_SHORT, MONTH_LONG } from "@/constants/date";

export function toE164(
  raw: string | undefined | null,
  defaultCountry: Country = "NG",
) {
  if (!raw) return undefined;
  const parsed = parsePhoneNumberFromString(raw, defaultCountry);
  return parsed?.isValid() ? parsed.number : undefined; // parsed.number is E.164
}



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

export function formatDate(d: Date) {
  return `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function formatRangeLabel(type: RangeType, range: DateRange) {
  switch (type) {
    case "day": return formatDate(range.from);
    case "month": return `${MONTH_LONG[range.from.getMonth()]} ${range.from.getFullYear()}`;
    case "year": return `${range.from.getFullYear()}`;
    default: return `${formatDate(range.from)} - ${formatDate(range.to)}`;
  }
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




export function endOfWeek(d: Date) {
  const s = startOfWeek(d);
  return addDays(s, 6);
}

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



 