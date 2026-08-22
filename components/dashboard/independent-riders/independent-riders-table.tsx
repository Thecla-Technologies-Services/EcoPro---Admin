"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import DetailPanel from "./detail-panel";
import { DataTable } from "@/components/shared/data-table";
import { DataState } from "@/components/shared/data-state";
import { RowActions } from "@/components/shared/row-actions";
import { Skeleton } from "@/components/ui/skeleton";
import TableDateFilter from "../../shared/date/table-date-filter";
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
                View Account
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
            data={data}
            headerExtra={
              <TableDateFilter
                selected={dateFilter}
                setSelected={setDateFilter}
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
