"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  /** The full code. Shorter than `length` while the admin is still typing. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Fired once the last empty slot is filled, with the completed code. */
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  invalid?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
  className?: string;
}

const DIGITS_ONLY = /\D/g;

export function OtpInput({
  value,
  onChange,
  onBlur,
  onComplete,
  length = 6,
  disabled,
  autoFocus,
  invalid,
  className,
  ...aria
}: OtpInputProps) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([]);

  const focusSlot = (index: number) => {
    const input = inputsRef.current[Math.min(Math.max(index, 0), length - 1)];
    input?.focus();
    input?.select();
  };

  const commit = (next: string) => {
    onChange(next);
    if (next.length === length) onComplete?.(next);
  };

  /**
   * Writes `digits` over the slots from `start` onwards. The code is kept gap
   * free — writing past the last filled slot appends instead of leaving holes.
   */
  const replaceFrom = (start: number, digits: string) => {
    const slots = value.split("");
    const from = Math.min(start, slots.length);

    for (let i = 0; i < digits.length && from + i < length; i++) {
      slots[from + i] = digits[i];
    }
    return slots.join("");
  };

  /** Removes one digit; anything after it shifts left, as in a plain text field. */
  const removeAt = (index: number) => {
    const slots = value.split("");
    slots.splice(index, 1);
    return slots.join("");
  };

  const handleChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const digits = event.target.value.replace(DIGITS_ONLY, "");
    if (!digits) return;

    // A slot already holding a digit shows two characters after a keystroke —
    // take the one the admin just typed, not the one being replaced.
    const typed = digits.length > 1 && value[index] ? digits.slice(-1) : digits;

    commit(replaceFrom(index, typed));
    focusSlot(index + typed.length);
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();

      // Backspacing an empty slot clears the previous one, so a single key
      // press always deletes something.
      const target = value[index] ? index : index - 1;
      if (target < 0) return;

      commit(removeAt(target));
      focusSlot(target);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusSlot(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusSlot(index + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusSlot(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusSlot(value.length);
    }
  };

  const handlePaste = (
    index: number,
    event: React.ClipboardEvent<HTMLInputElement>
  ) => {
    event.preventDefault();

    const digits = event.clipboardData
      .getData("text")
      .replace(DIGITS_ONLY, "")
      .slice(0, length - index);
    if (!digits) return;

    commit(replaceFrom(index, digits));
    focusSlot(index + digits.length);
  };

  return (
    <div
      role="group"
      aria-label={aria["aria-label"] ?? "Verification code"}
      className={cn("flex items-center gap-2 sm:gap-3", className)}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            inputsRef.current[index] = node;
          }}
          // Only the browser's autofill target carries the OTP hint, so a
          // suggested code lands in slot one and pastes across from there.
          autoComplete={index === 0 ? "one-time-code" : "off"}
          inputMode="numeric"
          type="text"
          maxLength={1}
          pattern="\d*"
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          aria-label={`Digit ${index + 1} of ${length}`}
          aria-invalid={invalid || undefined}
          aria-describedby={aria["aria-describedby"]}
          value={value[index] ?? ""}
          onChange={(event) => handleChange(index, event)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={(event) => handlePaste(index, event)}
          onFocus={(event) => event.target.select()}
          onBlur={onBlur}
          className={cn(
            "h-12 w-full min-w-0 max-w-14 rounded-xl border bg-background text-center text-lg font-medium tabular-nums transition-colors outline-none",
            "focus:border-2 focus:border-primary",
            "disabled:cursor-not-allowed disabled:opacity-60",
            invalid && "border-destructive"
          )}
        />
      ))}
    </div>
  );
}
