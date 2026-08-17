import { DisputeDetail } from "./dispute-detail";
import type { Dispute } from "@/types/dispute";
import { DisputeStatusPanel } from "./dispute-status-panel";

interface DisputeDetailProps {
  selected: Dispute;
}

export function DisputePanel({ selected }: DisputeDetailProps) {
  return (
    <div className="grid md:grid-cols-[1fr_380px] gap-4 min-h-150">
      {/* ── Left: dispute list ── */}
      <div className="flex flex-col gap-3 overflow-y-auto pr-1">
        <DisputeDetail dispute={selected!} />
      </div>

      {/* ── Right: detail panel ── */}

      <DisputeStatusPanel status={selected.status} />
    </div>
  );
}
