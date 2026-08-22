"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(({ className, label, icon, id, type, error, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const [hasValue, setHasValue] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  React.useEffect(() => {
    if (inputRef.current) {
      setHasValue(!!inputRef.current.value);
    }
  }, []);

  const isFloating = isFocused || hasValue;

  return (
    <div className="grid gap-1.5">
      <div
        className={cn(
          "relative flex items-center h-14 gap-3 rounded-xl bg-background px-4 py-3 border focus-within:border-2 focus-within:border-primary",
          className
        )}
      >
        {icon && <div className="text-muted-foreground shrink-0">{icon}</div>}

        <div className="relative flex-1">
          <label
            htmlFor={id}
            className={cn(
              "pointer-events-none absolute left-0 origin-left transition-all duration-200",
              isFloating
                ? "top-0 text-xs text-muted-foreground"
                : "top-1/2 -translate-y-1/2 text-base text-muted-foreground"
            )}
          >
            {label}
          </label>

          <input
            {...props}
            id={id}
            ref={(node) => {
              inputRef.current = node;

              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            type={resolvedType}
            className={cn(
              "w-full bg-transparent text-base outline-none",
              isFloating ? "pt-4" : "pt-0"
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              setHasValue(!!e.target.value);
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setHasValue(!!e.target.value);
              props.onChange?.(e);
            }}
          />
        </div>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
});

FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };