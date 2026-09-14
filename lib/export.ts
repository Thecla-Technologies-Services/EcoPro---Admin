import type { ColumnDef } from "@tanstack/react-table";

/**
 * The rows a table is currently showing, saved as a CSV file.
 *
 * Built from the table's own column definitions, so a column added to a table
 * is exported without this being touched. Columns whose header is not plain
 * text — a checkbox, the kebab menu — have nothing to write under, and are
 * skipped rather than exported as a blank column.
 *
 * Only CSV: nothing in the app can produce an xlsx, and a `.xlsx` file holding
 * comma-separated text is a file Excel refuses to open.
 */
export function downloadTableCsv<T>(
  columns: ColumnDef<T>[],
  rows: T[],
  filename: string,
) {
  const fields = columns
    .map((column) => column as { accessorKey?: string; header?: unknown })
    .filter(
      (column): column is { accessorKey: string; header: string } =>
        typeof column.accessorKey === "string" &&
        typeof column.header === "string" &&
        column.header.length > 0,
    );

  const escape = (cell: unknown) =>
    `"${String(cell ?? "").replace(/"/g, '""')}"`;

  const csv = [
    fields.map((field) => escape(field.header)).join(","),
    ...rows.map((row) =>
      fields
        .map((field) => escape((row as Record<string, unknown>)[field.accessorKey]))
        .join(","),
    ),
  ].join("\n");

  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
