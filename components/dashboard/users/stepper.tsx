"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeliveryPartnerStep } from "@/types/user";


export function DeliveryPartnerStepper({
  current,
  STEPS,
}: {
  STEPS: { key: DeliveryPartnerStep; label: string }[];
  current: DeliveryPartnerStep;
}) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <div className="flex w-full items-start">
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div
            key={step.key}
            className="flex flex-1 flex-col items-center last:flex-none"
          >
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  isComplete && "bg-emerald-600 text-white",
                  isCurrent && !isComplete && "bg-neutral-900 text-white",
                  !isComplete &&
                    !isCurrent &&
                    "bg-neutral-200 text-neutral-500",
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1 rounded-full transition-colors",
                    isComplete ? "bg-emerald-600" : "bg-neutral-200",
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-center text-xs",
                isCurrent ? "font-medium text-neutral-900" : "text-neutral-400",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
