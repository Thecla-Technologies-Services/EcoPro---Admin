"use client";

import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "../ui/select";

interface FloatingSelectProps {
  label: string;
  options: string[] | readonly string[];
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  disabled?: boolean;
}

export function FloatingSelect({
  label,
  options,
  value,
  onChange,
  error,
  className,
  disabled,
}: FloatingSelectProps) {
  const hasValue = Boolean(value);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        className={cn(
          "relative flex flex-col justify-center rounded-xl bg-background border px-4 h-14 transition-colors",
          "focus-within:border-primary focus-within:border-2",
          error && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {/* Floating label — animates up when a value is present */}
        <label
          className={cn(
            "pointer-events-none absolute left-4 origin-left transition-all duration-200 text-muted-foreground select-none",
            hasValue
              ? "top-1.5 text-xs font-medium tracking-wide capitalize text-primary"
              : "top-1/2 -translate-y-1/2 text-base",
            error && "text-destructive",
          )}
        >
          {label}
        </label>

        {/* Trigger is ALWAYS interactive — opacity-0 trick removed */}
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger
            className={cn(
              "w-full px-0 bg-transparent border-none shadow-none outline-none",
              "focus:ring-0 cursor-pointer text-foreground",
              // Shift content down when label has floated up
              hasValue ? "pt-4 text-base" : "text-transparent", // text-transparent hides the placeholder arrow area but keeps it clickable
            )}
          >
            <SelectValue placeholder="" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="pl-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}