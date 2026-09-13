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
      className={` ${styles.border} h-full rounded-lg bg-background md:p-5 p-4 md:py-7 flex items-center justify-between`}
    >
      <div className="grid gap-1 md:gap-2 ">
        <p className="text-2xl md:text-3xl font-bold text-foreground">
          {value}
        </p>
        <p className="text-xs md:text-sm text-muted-foreground ">{label}</p>
      </div>

      <Icon
        className={`${styles.icon} size-8 shrink-0 h-8 md:h-10! md:size-10 w-8 md:w-10!`}
      />
    </div>
  );
}
