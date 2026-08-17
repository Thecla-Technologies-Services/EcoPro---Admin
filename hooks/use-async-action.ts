"use client";

import { useCallback, useState } from "react";

type Status = "idle" | "loading" | "success";

export interface AsyncAction<TArgs extends unknown[]> {
  status: Status;
  isLoading: boolean;
  isSuccess: boolean;
  error: unknown;
  /** Runs the action; resolves to true when it succeeded. */
  run: (...args: TArgs) => Promise<boolean>;
  /** Back to the confirm step, clearing any previous outcome. */
  reset: () => void;
}

/**
 * The confirm → loading → success state machine every action dialog re-implements.
 *
 * Written out by hand it is easy to get the failure path wrong: the dialogs that
 * flip to "success" in a `finally`, or before awaiting, tell the admin an
 * application was rejected and an email sent when neither happened. Here a
 * rejection keeps the flow on its form and exposes `error` so it can be retried.
 *
 * ```tsx
 * const approve = useAsyncAction(() => reviewMutation.mutateAsync(id));
 * // approve.run(), approve.isLoading, approve.error, approve.isSuccess
 * ```
 */
export function useAsyncAction<TArgs extends unknown[]>(
  action: (...args: TArgs) => Promise<unknown>,
): AsyncAction<TArgs> {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<unknown>(null);

  const run = useCallback(
    async (...args: TArgs) => {
      setStatus("loading");
      setError(null);

      try {
        await action(...args);
        setStatus("success");
        return true;
      } catch (cause) {
        setError(cause);
        setStatus("idle");
        return false;
      }
    },
    [action],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return {
    status,
    isLoading: status === "loading",
    isSuccess: status === "success",
    error,
    run,
    reset,
  };
}
