"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * The icon-prefixed search field that sits in a table's header row.
 *
 * Server-side search is the norm here, so the value is always controlled by the
 * page that owns the query params.
 */
export function TableSearchInput({
  value,
  onChange,
  placeholder = "Search",
  className,
  inputClassName,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}) {
  return (
    <div className={cn("relative mt-5 w-full md:mt-3 md:w-60", className)}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <Input
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-9 rounded-md pl-9 text-sm ring-0 outline-none focus-within:border-primary focus-within:ring-0 focus-within:outline-0 focus-visible:border-primary md:rounded-lg",
          inputClassName,
        )}
      />
    </div>
  );
}
