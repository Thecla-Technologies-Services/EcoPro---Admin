import { cn } from "@/lib/utils";
import { Applicant } from "@/types/verification";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AccountBadge({ type }: { type: Applicant["accountType"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        type === "NGO"
          ? "bg-amber-100 text-amber-700"
          : "bg-purple-100 text-purple-700",
      )}
    >
      {type}
    </span>
  );
}

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
      className={cn(
        "w-full flex items-center gap-3 px-3 lg:px-4 py-3 text-left transition-colors",
        isSelected
          ? "bg-primary/10 border-l-4 border-primary"
          : "hover:bg-muted border-l-4 border-transparent",
      )}
    >
      <Avatar className="size-10 shrink-0">
        <AvatarImage src={applicant.avatarUrl} />
        <AvatarFallback className="text-sm font-semibold bg-muted-foreground/20">
          {applicant.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {applicant.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <AccountBadge type={applicant.accountType} />
          <span className="text-xs text-muted-foreground">
            {applicant.userId}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{applicant.date}</p>
      </div>
    </button>
  );
}
