import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/shared/query-error";
import { cn } from "@/lib/utils";

/**
 * Declarative branching for a panel fed by a query.
 *
 * Every module page hand-rolls the same ladder — error, then first load, then
 * empty, then the data (dimmed while a refetch is in flight). Written as nested
 * ternaries that ladder is hard to read and easy to get subtly wrong; here each
 * state is a named branch and the first one whose `when` is true wins:
 *
 * ```tsx
 * <DataState>
 *   <DataState.Error when={isError} error={error} onRetry={refetch} />
 *   <DataState.Loading when={isPending} rows={4} rowClassName="h-44" />
 *   <DataState.Empty when={!rows.length}>No listings found.</DataState.Empty>
 *   <DataState.Content busy={isFetching}>{…}</DataState.Content>
 * </DataState>
 * ```
 *
 * Branch order is the caller's, so a page that wants to keep showing stale rows
 * through a refetch simply puts `Content` first with its own condition.
 */
type BranchKind = "error" | "loading" | "empty" | "content";

type BranchComponent = { branchKind?: BranchKind };

export function DataState({ children }: { children: React.ReactNode }) {
  const match = React.Children.toArray(children)
    .filter(React.isValidElement)
    .find((child) => {
      const kind = (child.type as BranchComponent).branchKind;
      if (!kind) return false;
      // Content is the fallthrough — it matches once nothing above it did.
      if (kind === "content") return true;
      return Boolean((child.props as { when?: boolean }).when);
    });

  return match ?? null;
}

interface BranchProps {
  /** The branch is taken when this is true. */
  when?: boolean;
  children?: React.ReactNode;
  className?: string;
}

function DataStateError({
  error,
  onRetry,
  children,
  className,
}: BranchProps & { error: unknown; onRetry?: () => void }) {
  return (
    <>
      {children ?? (
        <QueryError error={error} onRetry={onRetry} className={className} />
      )}
    </>
  );
}
DataStateError.branchKind = "error" as const;

function DataStateLoading({
  rows = 5,
  rowClassName = "h-12",
  children,
  className,
}: BranchProps & {
  /** Placeholder rows to draw. Ignored when `children` is supplied. */
  rows?: number;
  rowClassName?: string;
}) {
  return (
    <div className={cn("space-y-3", className)} aria-busy>
      {children ??
        Array.from({ length: rows }, (_, index) => (
          <Skeleton key={index} className={cn("w-full", rowClassName)} />
        ))}
    </div>
  );
}
DataStateLoading.branchKind = "loading" as const;

function DataStateEmpty({ children, className }: BranchProps) {
  return (
    <div
      className={cn(
        "py-16 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      {children ?? "Nothing to show yet."}
    </div>
  );
}
DataStateEmpty.branchKind = "empty" as const;

function DataStateContent({
  busy,
  children,
  className,
}: Omit<BranchProps, "when"> & {
  /**
   * A background refetch. The content is dimmed rather than unmounted, so the
   * layout doesn't collapse and jump between pages.
   */
  busy?: boolean;
}) {
  return (
    <div
      aria-busy={busy}
      className={cn(busy && "opacity-60 transition-opacity", className)}
    >
      {children}
    </div>
  );
}
DataStateContent.branchKind = "content" as const;

DataState.Error = DataStateError;
DataState.Loading = DataStateLoading;
DataState.Empty = DataStateEmpty;
DataState.Content = DataStateContent;
