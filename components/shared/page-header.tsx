import { cn } from "@/lib/utils";

/**
 * The title / subtitle / actions band every module page opens with.
 *
 * Composed rather than prop-driven so a page can drop the subtitle, put two
 * buttons in the actions slot, or wrap a slot in its own dropdown without the
 * component growing a prop for each case:
 *
 * ```tsx
 * <PageHeader>
 *   <PageHeader.Heading>
 *     <PageHeader.Title>Listings</PageHeader.Title>
 *     <PageHeader.Description>Review and manage listings</PageHeader.Description>
 *   </PageHeader.Heading>
 *   <PageHeader.Actions>
 *     <Button>Add Listing</Button>
 *   </PageHeader.Actions>
 * </PageHeader>
 * ```
 */
function PageHeaderRoot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 md:flex-row md:items-start md:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Heading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid gap-2", className)}>{children}</div>;
}

function Title({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1
      className={cn(
        "text-2xl md:text-[28px] font-bold text-foreground",
        className,
      )}
    >
      {children}
    </h1>
  );
}

function Description({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
  );
}

/** Right-hand slot. Buttons stretch on mobile, sit inline from `md` up. */
function Actions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>{children}</div>
  );
}

export const PageHeader = Object.assign(PageHeaderRoot, {
  Heading,
  Title,
  Description,
  Actions,
});
