"use client";

import { useCallback, useState } from "react";
import { useSearchParams } from "next/navigation";

/**
 * A single search param as state — the selection survives a refresh and the
 * screen can be linked to, without a navigation on every click.
 *
 * The same approach as `useTabParam` (hooks/use-tab-param.ts), for a value that
 * has no fixed set to validate against: the URL seeds the initial value and is
 * rewritten with `history.replaceState`, which adds no history entry, so moving
 * between rows stays out of the back button.
 *
 * Reading the value back is the caller's job. A param naming something that is
 * no longer there is not an error — a queue drops rows as they are decided —
 * so a caller is expected to fall back rather than to trust it.
 *
 * ```tsx
 * const [applicant, selectApplicant] = useParamState("applicant");
 * ```
 */
export function useParamState(key: string) {
  const searchParams = useSearchParams();

  const [value, setValue] = useState<string | null>(
    () => searchParams?.get(key) ?? null,
  );

  // Stable, so a caller can sync the param from an effect without the identity
  // of this function retriggering it.
  const select = useCallback(
    (next: string | null) => {
      setValue(next);

      // Read from the live location rather than the hook's snapshot, so a param
      // another control changed in the meantime isn't dropped.
      const params = new URLSearchParams(window.location.search);
      if (next) params.set(key, next);
      else params.delete(key);

      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        query ? `?${query}` : window.location.pathname,
      );
    },
    [key],
  );

  return [value, select] as const;
}
