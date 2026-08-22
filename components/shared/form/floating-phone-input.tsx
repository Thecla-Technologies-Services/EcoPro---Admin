"use client";

import * as React from "react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import PhoneInputBase, { type Value, type Country } from "react-phone-number-input/input";
import { toPhoneValue } from "@/lib/phone";


interface FloatingPhoneInputProps {
  label: string;
  value: Value | undefined;
  onChange: (value: Value | undefined) => void;
  country?: Country;
  error?: string;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
}

export function FloatingPhoneInput({
  label,
  value,
  onChange,
  country = "NG",
  error,
  className,
  disabled,
  placeholder = "+234 123 456 7890",
  icon,
}: FloatingPhoneInputProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);

  const hasValue = Boolean(value);
  const isFloating = focused || hasValue;

  return (
    <div className="grid gap-1.5">
      <div
        className={cn(
          "relative flex items-center h-14 gap-3 rounded-xl bg-background px-4 py-3 border transition-colors",
          "focus-within:border-primary focus-within:border-2",
          error && "border-destructive",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
      >
        {icon && <div className="text-muted-foreground shrink-0">{icon}</div>}

        <div className="relative flex-1">
          {/* Floating label — animates up on focus or when a value is present */}
          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute left-0 origin-left transition-all duration-200 text-muted-foreground select-none",
              isFloating
                ? "top-0 text-xs font-medium tracking-wide capitalize text-primary"
                : "top-1/2 -translate-y-1/2 text-base",
              error && "text-destructive",
            )}
          >
            {label}
          </label>

          <PhoneInputBase
            id={id}
            country={country}
            value={toPhoneValue(value, country)}
            // The library emits `undefined` once the field is empty, but an
            // `undefined` form value reads as "unset" to react-hook-form, which
            // then falls back to the field's default — so clearing the input
            // made the original number reappear. An empty string is a real
            // value, and it is what the schemas already expect.
            onChange={(next) => onChange(next ?? "")}
            disabled={disabled}
            placeholder={isFloating ? placeholder : ""}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              "w-full bg-transparent border-none shadow-none outline-none",
              "text-base text-foreground placeholder:text-muted-foreground",
              isFloating ? "pt-4" : "pt-0",
            )}
          />
        </div>
      </div>

      {error && <p className="pl-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}