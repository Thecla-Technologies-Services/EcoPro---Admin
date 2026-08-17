import { IoCheckmarkOutline } from "react-icons/io5";
import { cn } from "@/lib/utils";
import { type DeliveryTimelineStep } from "@/types/donation";

export function DeliveryTimeline({ steps }: { steps: DeliveryTimelineStep[] }) {
  return (
    <div className="flex flex-col gap-0 mt-3">
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        return (
          <div key={step.label} className="flex items-start gap-3">
            {/* Icon + line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                  step.status === "done" && "border-primary bg-primary",
                  step.status === "active" && "border-[#1565C0] bg-white",
                  step.status === "pending" && "border-gray-300 bg-white",
                )}
              >
                {step.status === "done" && (
                  <IoCheckmarkOutline className="w-3 h-3 text-white" />
                )}
                {step.status === "active" && (
                  <div className="w-3 h-3 rounded-full bg-[#1565C0]" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 h-6",
                    step.status === "done" ? "bg-primary" : "bg-gray-200",
                  )}
                />
              )}
            </div>
            {/* Label */}
            <div className="pb-1">
              <p
                className={cn(
                  "text-sm",
                  step.status === "pending"
                    ? "text-gray-400"
                    : "text-gray-800 font-medium",
                )}
              >
                {step.label}
              </p>
              {step.subLabel && (
                <p className="text-xs text-primary">{step.subLabel}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
