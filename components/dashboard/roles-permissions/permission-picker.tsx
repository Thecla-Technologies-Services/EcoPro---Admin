"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/shared/query-error";
import { usePermissionCatalogue } from "@/hooks/admin/use-roles";
import { PermissionGrid } from "./permission-grid";

interface PermissionPickerProps {
  value: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
}

/**
 * The assignable-permission catalogue, with its own loading and failure states.
 *
 * Both the create and edit dialogs need the same fetch, so it lives here rather
 * than being threaded through each caller.
 */
export function PermissionPicker({
  value,
  onChange,
  disabled,
}: PermissionPickerProps) {
  const { data, isPending, isError, error, refetch } = usePermissionCatalogue();

  if (isPending) {
    return (
      <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2" aria-busy>
        {Array.from({ length: 10 }, (_, index) => (
          <Skeleton key={index} className="h-6 w-full" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <QueryError error={error} onRetry={() => refetch()} />;
  }

  if (!data?.length) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No assignable permissions are configured.
      </p>
    );
  }

  return (
    <PermissionGrid
      groups={data}
      value={value}
      onChange={onChange}
      disabled={disabled}
    />
  );
}
