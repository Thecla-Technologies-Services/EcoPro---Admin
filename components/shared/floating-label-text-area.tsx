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
>(({ className, label, error, id, ...props }, ref) => {
  return (
    <div className="grid gap-1.5">
      <div className="relative w-full border rounded-xl bg-background  focus-within:border-2 focus-within:border-primary">
        <Textarea
          {...props}
          id={id}
          ref={ref}
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

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
});

FloatingLabelTextarea.displayName = "FloatingLabelTextarea";

export { FloatingLabelTextarea };
