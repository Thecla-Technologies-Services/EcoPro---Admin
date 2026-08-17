export type RangeType = "day" | "week" | "month" | "year" | "custom";

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DateRangeFilterValue {
  type: RangeType;
  range: DateRange;
}

export interface DateRangeFilterProps {
  value?: DateRangeFilterValue;
  onChange?: (value: DateRangeFilterValue) => void;
  className?: string;
}
