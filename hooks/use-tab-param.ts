"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * Tab selection that survives a refresh and can be linked to, without a
 * navigation on every click.
 *
 * The URL seeds the initial tab and is rewritten with `history.replaceState` —
 * the approach Next documents for client-only search params. `replaceState`
 * adds no history entry, so switching tabs stays out of the back button, and the
 * rendered tab comes from local state rather than a re-read of the router.
 *
 * The first tab is the default and is left out of the URL, so the clean path
 * keeps working as a link to it.
 *
 * ```tsx
 * const [tab, setTab] = useTabParam(["roles", "admin-users"] as const);
 * ```
 */
export function useTabParam<T extends string>(
  tabs: readonly [T, ...T[]],
  key = "tab",
) {
  const searchParams = useSearchParams();

  const [active, setActive] = useState<T>(() => {
    const fromUrl = searchParams.get(key) as T | null;
    return fromUrl && tabs.includes(fromUrl) ? fromUrl : tabs[0];
  });

  const select = (tab: T) => {
    setActive(tab);

    // Read from the live location rather than the hook's snapshot, so a param
    // another control changed in the meantime isn't dropped.
    const params = new URLSearchParams(window.location.search);
    if (tab === tabs[0]) params.delete(key);
    else params.set(key, tab);

    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      query ? `?${query}` : window.location.pathname,
    );
  };

  return [active, select] as const;
}
