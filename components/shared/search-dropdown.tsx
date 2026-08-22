"use client";

import * as React from "react";
import { Search, Clock } from "lucide-react";
import Image from "next/image";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  Command,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

interface SearchDropDownProps {
  placeholder?: string;
  recentSearches?: string[];
  onSearch?: (query: string) => void;
  onSelectRecent?: (query: string) => void;
  className?: string;
}

export function SearchDropDown({
  placeholder = "Search with customer name or code...",
  recentSearches = [],
  onSearch,
  onSelectRecent,
  className,
}: SearchDropDownProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  // Cmd+K / Ctrl+K to open, mirrors standard command palette convention
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleSelectRecent(value: string) {
    setQuery(value);
    onSelectRecent?.(value);
    setOpen(false);
  }

  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && query.trim()) {
      onSearch?.(query.trim());
      setOpen(false);
    }
  }

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex cursor-pointer items-center gap-2.5 w-56 max-w-sm rounded-full border border-gray-200 bg-white px-4 py-2.5 text-left text-sm text-gray-400 hover:border-gray-300 transition-colors",
          className,
        )}
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="truncate">{query || placeholder}</span>
      </button>

      {/* Search dialog. `Command` belongs inside the dialog: it carries
          `size-full`, so left in the toolbar row it lays out as an empty
          full-width box beside the trigger. */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder="Search for Listings..."
            value={query}
            onValueChange={setQuery}
            onKeyDown={handleInputKeyDown}
          />
          <CommandList>
            <CommandEmpty className="pt-0! px-3 ">
              <p className="text-xs font-medium text-muted-foreground text-left">Search Results (0)</p>
              <div className=" gap-3 flex flex-col items-center">
                <div className="w-22.5 h-22.5 relative place-content-center">
                  <Image
                    alt="Empty state"
                    fill
                    src={"/assets/images/all-listing-empty.png"}
                    className="object-cover"
                  />
                </div>
                <p className="font-medium"> No results found.</p>
              </div>
            </CommandEmpty>
            {recentSearches.length > 0 && (
              <CommandGroup heading="Recent Search">
                {recentSearches.map((item, idx) => (
                  <CommandItem
                    key={`${item}-${idx}`}
                    value={item}
                    onSelect={handleSelectRecent}
                    className="gap-2.5"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{item}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
