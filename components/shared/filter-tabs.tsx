"use client";

import * as React from "react";
import TabButton from "@/components/shared/tab-button";
import { cn } from "@/lib/utils";

interface FilterTabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const FilterTabsContext = React.createContext<FilterTabsContextValue | null>(
  null,
);

function useFilterTabs() {
  const context = React.useContext(FilterTabsContext);
  if (!context) {
    throw new Error("FilterTabs.Tab must be rendered inside <FilterTabs>");
  }
  return context;
}

/**
 * The row of status filters above a list.
 *
 * The active value and the change handler live on the root, so a tab only
 * declares what it is — and a module can render a tab conditionally, or give one
 * a count and another none, without the row needing to know:
 *
 * ```tsx
 * <FilterTabs value={tab} onChange={changeTab}>
 *   <FilterTabs.Tab value="all">All Listings</FilterTabs.Tab>
 *   <FilterTabs.Tab value="active" count={metrics?.activeListings}>Active</FilterTabs.Tab>
 *   <FilterTabs.Tab value="flagged" count={metrics?.flaggedItems} flagged>Flagged</FilterTabs.Tab>
 * </FilterTabs>
 * ```
 */
function FilterTabsRoot({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useMemo(() => ({ value, onChange }), [value, onChange]);

  return (
    <FilterTabsContext.Provider value={context}>
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {children}
      </div>
    </FilterTabsContext.Provider>
  );
}

function Tab({
  value,
  count,
  flagged,
  children,
}: {
  value: string;
  /** Appended in parentheses. Left off when undefined, so a tab that has no
   *  counter reads as a plain label rather than "(0)". */
  count?: number;
  /** Styles the active state in red — used for flagged/at-risk filters. */
  flagged?: boolean;
  children: React.ReactNode;
}) {
  const { value: active, onChange } = useFilterTabs();

  return (
    <TabButton
      active={active === value}
      flagged={flagged}
      onClick={() => onChange(value)}
    >
      {children}
      {count === undefined ? "" : ` (${count})`}
    </TabButton>
  );
}

export const FilterTabs = Object.assign(FilterTabsRoot, { Tab });
