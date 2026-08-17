"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toErrorMessage } from "@/lib/api/errors";

interface QueryErrorProps {
  error: unknown;
  /** Pass a query's `refetch` to offer a retry. */
  onRetry?: () => void;
  className?: string;
}

/** Shared failure state for a panel whose data could not be loaded. */
export function QueryError({ error, onRetry, className }: QueryErrorProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 rounded-lg bg-background p-6 text-center ${className ?? ""}`}
    >
      <TriangleAlert className="size-8 text-destructive" strokeWidth={1.75} />
      <p className="text-sm text-muted-foreground">{toErrorMessage(error)}</p>
      {onRetry && (
        <Button variant="secondary" className="rounded-full" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
