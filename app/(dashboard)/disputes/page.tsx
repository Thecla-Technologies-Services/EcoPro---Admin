import { Loader } from "lucide-react";
import {
  IoChatbubblesOutline,
  IoFolderOpenOutline,
  IoLockClosedOutline,
} from "react-icons/io5";
import { HiOutlineDocumentCheck } from "react-icons/hi2";
import SharedStatCard from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import DisputeTable from "@/components/dashboard/disputes/dispute-table";

export default function DisputesPage() {
  return (
    <div className="space-y-6 w-full overflow-x-hidden">
      <div className="grid gap-2">
        <h1 className="text-2xl md:text-[28px] font-bold">Dispute</h1>
        <p className="text-sm text-muted-foreground">
          Review and resolve transaction disputes
        </p>
      </div>
      <StatGrid columns={5}>
        <SharedStatCard
          label="All Disputes"
          value={12204}
          icon={IoChatbubblesOutline}
        />
        <SharedStatCard label="Open" value={67} icon={IoFolderOpenOutline} />
        <SharedStatCard label="In Progress" value={198} icon={Loader} />
        <SharedStatCard
          label="Resolved"
          value={145}
          icon={HiOutlineDocumentCheck}
        />
        <SharedStatCard label="Closed" value={145} icon={IoLockClosedOutline} />
      </StatGrid>
      <DisputeTable />
    </div>
  );
}
