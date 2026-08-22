"use client";

import { cn } from "@/lib/utils";
import { Applicant } from "@/types/verification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";

/** First letter of each word — the fallback when no avatar was uploaded. */
function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("");
}

/**
 * One row in the verification queue. The selected row carries a green wash and a
 * thick left edge; the others keep a transparent edge of the same width so
 * selecting a row shifts nothing sideways.
 */
export default function QueueItem({
  applicant,
  isSelected,
  onClick,
}: {
  applicant: Applicant;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isSelected}
      className={cn(
        "flex w-full items-center gap-3 border-l-4 px-3 py-3 text-left transition-colors lg:px-4",
        isSelected
          ? "border-primary bg-primary/10"
          : "border-transparent hover:bg-muted",
      )}
    >
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={applicant.avatarUrl} />
        <AvatarFallback className="bg-muted-foreground/20 text-sm font-semibold">
          {initials(applicant.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {applicant.name}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <StatusBadge status={applicant.accountType} />
          {/* The short code when the directory issued one — a raw uuid would
              swamp a row this narrow. */}
          <span className="truncate text-xs text-muted-foreground">
            {applicant.userCode || applicant.userId}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{applicant.date}</p>
      </div>
    </button>
  );
}
