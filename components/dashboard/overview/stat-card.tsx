"use client";

import { IconType } from "react-icons";

interface StatCardProps {
  /**
   * A string is rendered as given; a node is how a figure that converts between
   * currencies brings its own markup.
   */
  value: React.ReactNode;
  label: string;
  icon: IconType;
  color: "green" | "blue" | "emerald" | "orange";
}

const colorMap = {
  green: {
    border: "border-l-4 border-l-primary",
    icon: "text-primary",
  },
  blue: {
    border: "border-l-4 border-l-[#0E3CAB]",
    icon: "text-[#0E3CAB]",
  },
  emerald: {
    border: "border-l-4 border-l-primary",
    icon: "text-primary",
  },
  orange: {
    border: "border-l-4 border-l-[#F57F17]",
    icon: "text-[#F57F17]",
  },
};

export function StatCard({ value, label, icon: Icon, color }: StatCardProps) {
  const styles = colorMap[color];

  return (
    <div
      className={`${styles.border} flex h-full items-center justify-between gap-3 rounded-lg bg-background p-4 md:p-5 md:py-7`}
    >
      {/* `min-w-0` so the figure governs the card's width rather than forcing
          it: without it the flex item refuses to shrink and the icon is pushed
          out of the card. */}
      <div className="grid min-w-0 gap-1 md:gap-2">
        {/* Stepped rather than fixed at `3xl`, and kept on one line: at four
            across on a laptop, "NGN 15.8M" broke after the currency and the
            label fell out of line with the cards beside it. */}
        <p className="truncate text-xl font-bold whitespace-nowrap text-foreground md:text-2xl xl:text-3xl">
          {value}
        </p>
        <p className="text-xs text-muted-foreground md:text-sm">{label}</p>
      </div>

      <Icon className={`${styles.icon} size-8 shrink-0 md:size-10`} />
    </div>
  );
}
