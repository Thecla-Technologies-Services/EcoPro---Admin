import { AuditTable } from "@/components/dashboard/audit-log/audit-table";
import { PageHeader } from "@/components/shared/page-header";

export default function AuditLogPage() {
  return (
    <div className="w-full space-y-6 overflow-x-hidden">
      <PageHeader>
        <PageHeader.Heading className="gap-0.5">
          <PageHeader.Title className="font-semibold">
            Audit Log
          </PageHeader.Title>
          <PageHeader.Description>
            Every administrative action, and who performed it
          </PageHeader.Description>
        </PageHeader.Heading>
      </PageHeader>

      <AuditTable />
    </div>
  );
}
