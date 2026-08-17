"use client";

import { useEffect, useState } from "react";

/**
 * Delays propagating a rapidly-changing value — typing in a search box — so it
 * can be used as a query key without firing a request per keystroke.
 */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
