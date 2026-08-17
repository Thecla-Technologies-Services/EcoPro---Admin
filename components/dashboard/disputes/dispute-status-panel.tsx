import * as React from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/status-badge";

export type DisputeStatus = "Open" | "In Progress" | "Resolved" | "Closed";

interface DisputeStatusPanelProps {
  status: DisputeStatus;
  onMarkResolved?: () => void;
  onMarkClosed?: () => void;
  onReopen?: () => void;
  className?: string;
}

const statusDescriptions: Record<DisputeStatus, string> = {
  Open: "This dispute is currently open and awaiting review.",
  "In Progress": "This dispute is currently open and awaiting review.",
  Resolved: "This dispute has been reviewed and marked as resolved.",
  Closed: "This dispute is currently closed.",
};

interface ActionButtonProps {
  label: string;
  icon: React.ReactNode;
  variant: "resolve" | "close" | "reopen";
  onClick?: () => void;
}

const actionVariantStyles: Record<ActionButtonProps["variant"], string> = {
  resolve: "bg-[#DCF3E3] text-[#2D7A4F] hover:bg-[#cdeeda]",
  close: "bg-gray-100 text-gray-500 hover:bg-gray-200",
  reopen: "bg-[#DCF3E3] text-[#2D7A4F] hover:bg-[#cdeeda]",
};

function ActionButton({ label, icon, variant, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2.5 rounded-full px-4 py-3 text-sm font-medium transition-colors",
        actionVariantStyles[variant],
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatusSection({ status }: { status: DisputeStatus }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Current Status</h3>
      <StatusBadge status={status} />
      <p className="text-sm text-gray-500 leading-relaxed">
        {statusDescriptions[status]}
      </p>
    </div>
  );
}

function AdminActionsSection({
  status,
  onMarkResolved,
  onMarkClosed,
  onReopen,
}: {
  status: DisputeStatus;
  onMarkResolved?: () => void;
  onMarkClosed?: () => void;
  onReopen?: () => void;
}) {
  const isClosed = status === "Closed";

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        Admin Actions
      </h3>
      <div className="flex flex-col gap-3">
        {isClosed ? (
          <ActionButton
            label="Reopen ticket"
            icon={<RotateCcw className="w-4 h-4" />}
            variant="reopen"
            onClick={onReopen}
          />
        ) : (
          <>
            <ActionButton
              label="Mark as Resolved"
              icon={<Check className="w-4 h-4" />}
              variant="resolve"
              onClick={onMarkResolved}
            />
            <ActionButton
              label="Mark as Closed"
              icon={<X className="w-4 h-4" />}
              variant="close"
              onClick={onMarkClosed}
            />
          </>
        )}
      </div>
    </div>
  );
}

export function DisputeStatusPanel({
  status,
  onMarkResolved,
  onMarkClosed,
  onReopen,
  className,
}: DisputeStatusPanelProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="bg-white rounded-lg border border-gray-100 p-4">
        <StatusSection status={status} />
      </div>
      <div className="bg-white rounded-lg border border-gray-100 p-4">
        <AdminActionsSection
          status={status}
          onMarkResolved={onMarkResolved}
          onMarkClosed={onMarkClosed}
          onReopen={onReopen}
        />
      </div>
    </div>
  );
}
