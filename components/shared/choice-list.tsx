"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ChoiceListContextValue {
  value: string | null;
  onChange: (value: string) => void;
}

const ChoiceListContext = React.createContext<ChoiceListContextValue | null>(
  null,
);

function useChoiceList() {
  const context = React.useContext(ChoiceListContext);
  if (!context) {
    throw new Error("ChoiceList.Option must be rendered inside <ChoiceList>");
  }
  return context;
}

/**
 * A single-select list of large tappable rows — the reason pickers in the reject
 * and dispute flows.
 *
 * ```tsx
 * <ChoiceList value={reason} onChange={setReason}>
 *   <ChoiceList.Options items={REJECTION_REASONS} />
 * </ChoiceList>
 * ```
 */
function ChoiceListRoot({
  value,
  onChange,
  children,
  className,
}: {
  value: string | null;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useMemo(() => ({ value, onChange }), [value, onChange]);

  return (
    <ChoiceListContext.Provider value={context}>
      <div
        role="radiogroup"
        className={cn("space-y-2 md:space-y-3", className)}
      >
        {children}
      </div>
    </ChoiceListContext.Provider>
  );
}

function Option({
  value,
  children,
  className,
}: {
  value: string;
  /** Defaults to the value, which is the label in every current picker. */
  children?: React.ReactNode;
  className?: string;
}) {
  const { value: selected, onChange } = useChoiceList();
  const isSelected = selected === value;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onChange(value)}
      className={cn(
        // Tailwind's preflight gives a button `cursor: default`, so every
        // clickable in this app sets the pointer itself.
        "w-full cursor-pointer rounded-md border px-3 py-4 text-left text-sm font-semibold transition-all md:text-base md:font-bold",
        isSelected
          ? "border-2 border-primary text-foreground"
          : "border-transparent bg-input text-foreground hover:border-border",
        className,
      )}
    >
      {children ?? value}
    </button>
  );
}

/** Renders one `Option` per string, for the common list-of-labels case. */
function Options({ items }: { items: readonly string[] }) {
  return (
    <>
      {items.map((item) => (
        <Option key={item} value={item} />
      ))}
    </>
  );
}

export const ChoiceList = Object.assign(ChoiceListRoot, { Option, Options });
