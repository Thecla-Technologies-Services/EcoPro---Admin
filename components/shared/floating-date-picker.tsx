"use client";

import * as React from "react";
import { format, isValid, parse } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FloatingLabelInput } from "@/components/shared/floating-label-input";
import { cn } from "@/lib/utils";

interface FloatingDatePickerProps {
  label: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  error?: string;
  disabled?: boolean;
  fromDate?: Date;
  toDate?: Date;
  className?: string;
  id?: string;
}

const DISPLAY_FORMAT = "MMM d, yyyy";
const PARSE_FORMAT = "MMM d, yyyy";

export function FloatingDatePicker({
  label,
  value,
  onChange,
  error,
  disabled,
  className,
  id,
}: FloatingDatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [draftInput, setDraftInput] = React.useState("");

  const inputValue = draftInput || (value ? format(value, DISPLAY_FORMAT) : "");

  function handleInputChange(raw: string) {
    setDraftInput(raw);
    const parsed = parse(raw, PARSE_FORMAT, new Date());
    if (isValid(parsed)) {
      onChange?.(parsed);
      setDraftInput("");
    } else if (raw === "") {
      onChange?.(undefined);
    }
  }

  function handleDaySelect(day: Date | undefined) {
    onChange?.(day);
    setDraftInput("");
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("cursor-pointer", className)}>
          <FloatingLabelInput
            id={id}
            label={label}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setOpen(true)}
            error={error}
            disabled={disabled}
            autoComplete="off"
            icon={
              <CalendarDays
                className={cn(
                  "size-4 transition-colors",
                  open ? "text-primary" : "text-muted-foreground",
                )}
              />
            }
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0 shadow-lg"
        align="start"
        sideOffset={6}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDaySelect}
          defaultMonth={value}
          classNames={{
            day: cn(
              "h-9 w-9 rounded-lg text-sm font-normal",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:bg-accent focus-visible:outline-none",
            ),
          }}
        />

        <div className="border-t p-2 grid grid-cols-3 gap-1">
          {[
            { label: "Today", offset: 0 },
            { label: "Tomorrow", offset: 1 },
            { label: "In 7 days", offset: 7 },
            { label: "In 14 days", offset: 14 },
            { label: "In 30 days", offset: 30 },
            { label: "In 90 days", offset: 90 },
          ].map(({ label: shortcutLabel, offset }) => {
            const target = new Date();
            target.setDate(target.getDate() + offset);
            const isSelected =
              value &&
              format(value, "yyyy-MM-dd") === format(target, "yyyy-MM-dd");

            return (
              <button
                key={shortcutLabel}
                type="button"
                onClick={() => handleDaySelect(target)}
                className={cn(
                  "text-xs px-2 py-1.5 rounded-md transition-colors text-left",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-muted-foreground hover:text-foreground",
                )}
              >
                {shortcutLabel}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
