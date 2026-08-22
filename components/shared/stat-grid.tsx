import * as React from "react";
import { FadeIn } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

interface StatGridProps {
  children: React.ReactNode;
  /** Columns from the `lg` breakpoint up. Below it the grid is always 2-up. */
  columns?: 2 | 3 | 4 | 5;
  /**
   * Seconds added per card for the entry stagger. Pass 0 to opt out of the
   * animation entirely — the cards then render unwrapped.
   */
  stagger?: number;
  className?: string;
}

const columnClass: Record<NonNullable<StatGridProps["columns"]>, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  // Five cards at `lg` leaves each one too narrow for a long figure, so the
  // last column waits for `xl`.
  5: "lg:grid-cols-3 xl:grid-cols-5",
};

/**
 * The metrics row shared by every module page: a responsive grid that fades its
 * children in one after another.
 *
 * The stagger lives here rather than at each call site, so pages no longer carry
 * a hand-maintained `delay` alongside every stat.
 *
 * ```tsx
 * <StatGrid>
 *   <SharedStatCard label="Total Users" value={total} icon={Users} />
 *   <SharedStatCard label="Suspended" value={suspended} icon={UserX} />
 * </StatGrid>
 * ```
 */
export function StatGrid({
  children,
  columns = 4,
  stagger = 0.1,
  className,
}: StatGridProps) {
  const cards = React.Children.toArray(children).filter(Boolean);

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 md:gap-4",
        columnClass[columns],
        className,
      )}
    >
      {stagger === 0
        ? cards
        : cards.map((card, index) => (
            <FadeIn
              // Children are positional here — a stat's slot in the row is its
              // identity, and the row is never reordered.
              key={index}
              delay={stagger * (index + 1)}
              className="h-full"
            >
              {card}
            </FadeIn>
          ))}
    </div>
  );
}
