"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Label/value facts — bank details, order summaries, application details.
 *
 * The three layouts the dashboard uses are variants of one list rather than
 * three components, so a row moved between a dialog and a card keeps its markup
 * and only the container changes:
 *
 * - `between` — label left, value right, on one line (default)
 * - `stacked` — label above value, divided by hairlines
 * - `inline`  — compact `between` for dense sidebars
 *
 * ```tsx
 * <DetailList variant="stacked">
 *   <DetailList.Row label="Account Name" value={bank.accountName} />
 *   <DetailList.Row label="Status" value={<StatusBadge status={status} />} />
 * </DetailList>
 * ```
 */
type DetailVariant = "between" | "stacked" | "inline";

const VariantContext = React.createContext<DetailVariant>("between");

const containerClass: Record<DetailVariant, string> = {
  between: "space-y-3 md:space-y-5",
  stacked: "flex flex-col",
  inline: "space-y-0",
};

function DetailListRoot({
  children,
  variant = "between",
  /** Wraps the list in the bordered white panel used inside detail dialogs. */
  boxed = false,
  className,
}: {
  children: React.ReactNode;
  variant?: DetailVariant;
  boxed?: boolean;
  className?: string;
}) {
  return (
    <VariantContext.Provider value={variant}>
      <div
        className={cn(
          containerClass[variant],
          boxed &&
            "rounded-lg border border-border bg-white px-2 py-4 md:px-4 md:py-6",
          className,
        )}
      >
        {children}
      </div>
    </VariantContext.Provider>
  );
}

interface RowProps {
  label: React.ReactNode;
  /** Omit and pass children instead when the value needs its own markup. */
  value?: React.ReactNode;
  children?: React.ReactNode;
  /** Overrides the list's variant — for a lone row outside any list. */
  variant?: DetailVariant;
  labelClassName?: string;
  valueClassName?: string;
  className?: string;
}

function Row({
  label,
  value,
  children,
  variant: variantOverride,
  labelClassName,
  valueClassName,
  className,
}: RowProps) {
  // Read unconditionally — `??` would skip the hook when an override is passed.
  const listVariant = React.useContext(VariantContext);
  const variant = variantOverride ?? listVariant;
  const content = children ?? value;

  if (variant === "stacked") {
    return (
      <div
        className={cn(
          "flex flex-col gap-0.5 border-b border-gray-100 py-2.5 last:border-0",
          className,
        )}
      >
        <span className={cn("text-xs text-gray-400", labelClassName)}>
          {label}
        </span>
        <span
          className={cn(
            "text-sm font-medium text-gray-900",
            valueClassName,
          )}
        >
          {content}
        </span>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div className={cn("flex items-start justify-between py-1.5", className)}>
        <span
          className={cn("w-32 shrink-0 text-xs text-gray-400", labelClassName)}
        >
          {label}
        </span>
        <span
          className={cn("text-right text-xs text-gray-800", valueClassName)}
        >
          {content}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <span className={cn("text-sm text-muted-foreground", labelClassName)}>
        {label}
      </span>
      <span
        className={cn(
          "text-right text-sm font-semibold text-foreground",
          valueClassName,
        )}
      >
        {content}
      </span>
    </div>
  );
}

/** Renders `{ label, value }[]` straight from an adapter. */
function Rows({
  items,
  valueClassName,
}: {
  items: readonly { label: string; value: React.ReactNode }[];
  valueClassName?: string;
}) {
  return (
    <>
      {items.map((item) => (
        <Row
          key={item.label}
          label={item.label}
          value={item.value}
          valueClassName={valueClassName}
        />
      ))}
    </>
  );
}

export const DetailList = Object.assign(DetailListRoot, { Row, Rows });
