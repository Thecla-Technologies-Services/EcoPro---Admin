import { DetailList } from "@/components/shared/detail-list";

/**
 * Donation-panel facts — the shared list's compact `inline` row, kept as a named
 * export because the panel reads better with `<InfoRow>` than a variant string
 * repeated at every call site.
 */
export function InfoRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <DetailList.Row
      variant="inline"
      label={label}
      value={value}
      valueClassName={valueClassName}
    />
  );
}
