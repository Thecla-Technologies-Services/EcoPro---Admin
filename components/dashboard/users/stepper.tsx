"use client";

import { Fragment } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The progress rail above a multi-step create/edit dialog. The step key is the
 * caller's own union — delivery partners run three steps, a charity partner two — so this
 * takes whatever set it is handed rather than naming them.
 *
 * Each label is centred under its own disc rather than under the segment
 * between two of them, and the connecting rails take up whatever space the
 * labels leave.
 *
 * A disc is ticked only once the form has moved past it — the step in hand is
 * green but keeps its number, so the rail always says where you are.
 */
export function FormStepper<Step extends string>({
  current,
  STEPS,
}: {
  STEPS: { key: Step; label: string }[];
  current: Step;
}) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <div className="flex w-full items-start">
      {STEPS.map((step, index) => {
        // The tick means done, so only a step the form has moved past earns
        // one. The step being filled in is green but still shows its number.
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <Fragment key={step.key}>
            {/* Disc and label share one column so the label centres on its own
                disc. The column is as wide as the label, which is what pushes
                the first and last discs in off the rail's ends. */}
            <div className="flex shrink-0 flex-col items-center gap-2">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-sm font-medium transition-colors",
                  isComplete || isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "bg-neutral-100 text-neutral-900",
                )}
              >
                {isComplete ? <Check className="size-4" /> : index + 1}
              </div>
              <span className="text-xs whitespace-nowrap text-neutral-700">
                {step.label}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              // 13px down puts the 3px rail on the 28px disc's centre line.
              <div
                className={cn(
                  "mx-2 mt-[13px] h-[3px] flex-1 rounded-full transition-colors",
                  isComplete ? "bg-primary" : "bg-neutral-100",
                )}
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
