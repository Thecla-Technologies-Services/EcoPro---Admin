"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import DetailPanel from "./detail-panel";
import { DataTable } from "@/components/shared/data-table";
import { DataState } from "@/components/shared/data-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/shared/row-actions";
import { Skeleton } from "@/components/ui/skeleton";
import TableDateFilter from "../../shared/date/table-date-filter";
import { downloadTableCsv } from "@/lib/export";
import { DateRangeFilterValue } from "@/types/date";
import { type Applicant } from "@/types/verification";

const PAGE_SIZE = 7;

/** Every rider fact renders the same way — as text, or a dash when unknown. */
function Field({ value }: { value: string | undefined }) {
  return (
    <span className="text-sm text-foreground font-medium">{value || "—"}</span>
  );
}

interface IndependentRidersTableProps {
  data: Applicant[];
  isLoading?: boolean;
}

export default function IndependentRidersTable({
  data,
  isLoading,
}: IndependentRidersTableProps) {
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(
    null,
  );
  const [dateFilter, setDateFilter] = useState<
    DateRangeFilterValue | undefined
  >(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");

  // The rows arrive whole from the page above, so searching them is a filter
  // here rather than a parameter on a request.
  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data;

    return data.filter((applicant) =>
      [
        applicant.name,
        applicant.email,
        applicant.phone,
        applicant.country,
        applicant.status,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    );
  }, [data, search]);

  const columns = useMemo<ColumnDef<Applicant>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Full Name",
        cell: ({ getValue }) => <Field value={getValue<string>()} />,
      },
      {
        accessorKey: "country",
        header: "Country",
        cell: ({ getValue }) => <Field value={getValue<string>()} />,
      },
      {
        accessorKey: "email",
        header: "Email Address",
        cell: ({ getValue }) => <Field value={getValue<string>()} />,
      },
      {
        accessorKey: "phone",
        header: "Phone Number",
        cell: ({ getValue }) => <Field value={getValue<string>()} />,
      },
      {
        accessorKey: "documentType",
        header: "Uploaded Document",
        cell: ({ getValue }) => <Field value={getValue<string>()} />,
      },
      {
        accessorKey: "status",
        header: "Status",
        // The application's standing — Pending Review until a decision is
        // recorded, then Approved or Rejected. An undocumented value from the
        // API passes through as its own label rather than being forced into
        // one of the three.
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
      },
      {
        accessorKey: "utr",
        header: "UTR Number",
        cell: ({ getValue }) => <Field value={getValue<string>()} />,
      },
      {
        accessorKey: "idNumber",
        header: "ID Number",
        cell: ({ getValue }) => <Field value={getValue<string>()} />,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const applicant = row.original;
          return (
            <RowActions>
              <RowActions.Item
                icon={Eye}
                onSelect={() => {
                  setSelectedApplicant(applicant);
                  setDialogOpen(true);
                }}
              >
                View Rider
              </RowActions.Item>
            </RowActions>
          );
        },
      },
    ],
    [],
  );

  return (
    <>
      <DataState>
        {/* First load has nothing to dim, so it gets placeholders instead. */}
        <DataState.Loading
          when={isLoading && !data.length}
          className="rounded-lg bg-white p-4"
        >
          <Skeleton className="h-9 w-full max-w-md" />
          {Array.from({ length: PAGE_SIZE }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </DataState.Loading>
        {/* Dim rather than unmount while a refetch is in flight, so approving a
            row doesn't collapse the table and jump the layout. */}
        <DataState.Content busy={isLoading}>
          <DataTable
            data={rows}
            headerExtra={
              <TableDateFilter
                selected={dateFilter}
                setSelected={setDateFilter}
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search riders"
                onExport={() =>
                  downloadTableCsv(columns, rows, "independent-riders.csv")
                }
              />
            }
            columns={columns}
            rowLabel="independent riders"
            pageSize={PAGE_SIZE}
          />
        </DataState.Content>
      </DataState>

      <DetailPanel
        applicant={selectedApplicant}
        open={dialogOpen}
        onOpenChange={() => {
          setDialogOpen(false);
          setSelectedApplicant(null);
        }}
      />
    </>
  );
}
