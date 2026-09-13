import { Skeleton } from "@/components/ui/skeleton";

export default function SharedStatCard({
  label,
  value,
  icon: Icon,
  isLoading,
  ref,
}: {
  label: string;
  /**
   * A number or string is formatted here; a node is rendered as given — which
   * is how a figure that converts between currencies brings its own markup.
   */
  value: React.ReactNode;
  icon: React.ElementType;
  /** Shows a placeholder in place of the figure while it is being fetched. */
  isLoading?: boolean;
  ref?: React.RefObject<HTMLParagraphElement | null>;
}) {
  return (
    <div
      className="bg-background rounded-md h-full p-3 md:p-5 flex items-center justify-between gap-3"
      aria-busy={isLoading}
    >
      <div className="grid min-w-0 gap-1">
        {isLoading ? (
          // Sized to the rendered figure so the card doesn't resize when the
          // number lands.
          <Skeleton className="h-8 md:h-10 w-20 md:w-28" />
        ) : (
          <p
            ref={ref}
            className="truncate text-2xl md:text-[32px]  font-bold text-[#1B1C1E]"
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        )}
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      </div>

      <Icon className="size-6 md:size-8 text-[#1B1C1E] shrink-0" />
    </div>
  );
}
