"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface FloatingLabelTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const FloatingLabelTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FloatingLabelTextareaProps
>(({ className, label, error, id, onChange, ...props }, ref) => {
  /**
   * Only tracked for the counter. The field is normally uncontrolled — it is
   * registered with react-hook-form — so the length has to come from the
   * keystrokes rather than from a `value` prop; when a caller does control it,
   * that prop is the truth and this state is ignored.
   */
  const [typedLength, setTypedLength] = React.useState(
    () => String(props.defaultValue ?? "").length,
  );

  const isControlled = props.value !== undefined;
  const length = isControlled ? String(props.value).length : typedLength;

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTypedLength(event.target.value.length);
    onChange?.(event);
  };

  return (
    <div className="grid gap-1.5">
      <div className="relative w-full border rounded-xl bg-background  focus-within:border-2 focus-within:border-primary">
        <Textarea
          {...props}
          id={id}
          ref={ref}
          onChange={handleChange}
          placeholder=" "
          className={cn(
            "peer min-h-28 wrap-break-word min-w-0  outline-0 pt-5 ring-0! border-0",
            props.onFocus ? "pt-0" : "pt-6",
            className,
          )}
        />

        <label
          htmlFor={id}
          className="
            pointer-events-none
            absolute
            left-3
            top-2
            text-xs
            text-muted-foreground
            transition-all
            duration-200

            peer-placeholder-shown:top-3.5
            peer-placeholder-shown:text-sm
            peer-placeholder-shown:text-muted-foreground

            peer-focus:top-2
            peer-focus:text-xs
            peer-focus:text-primary
          "
        >
          {label}
        </label>
      </div>

      {/* The counter shares the row with the error so neither shifts the
          layout when the other appears. */}
      <div className="flex items-start justify-between gap-3 empty:hidden">
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : (
          <span />
        )}
        {props.maxLength !== undefined && (
          <p
            aria-live="polite"
            className={cn(
              "text-xs tabular-nums text-muted-foreground",
              length >= props.maxLength && "text-destructive",
            )}
          >
            {length}/{props.maxLength}
          </p>
        )}
      </div>
    </div>
  );
});

FloatingLabelTextarea.displayName = "FloatingLabelTextarea";

export { FloatingLabelTextarea };
