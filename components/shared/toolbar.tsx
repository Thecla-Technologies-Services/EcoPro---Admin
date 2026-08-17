import { cn } from "@/lib/utils";

/**
 * The band between a page's stats and its list: filters on the left, search and
 * date pickers on the right, wrapping to two lines on small screens.
 *
 * ```tsx
 * <Toolbar>
 *   <Toolbar.Start>
 *     <FilterTabs …>…</FilterTabs>
 *   </Toolbar.Start>
 *   <Toolbar.End>
 *     <SearchDropDown … />
 *   </Toolbar.End>
 * </Toolbar>
 * ```
 */
function ToolbarRoot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Start({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

function End({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2 md:ml-auto", className)}>
      {children}
    </div>
  );
}

export const Toolbar = Object.assign(ToolbarRoot, { Start, End });
