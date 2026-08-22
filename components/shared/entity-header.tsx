import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * The "who is this" band at the top of a detail view: avatar and name on the
 * left, contact facts on the right.
 *
 * `title` and `description` are slots rather than strings so a dialog can pass
 * `DialogTitle` / `DialogDescription` (keeping Radix's labelling intact) while a
 * card passes plain text.
 *
 * ```tsx
 * <EntityHeader>
 *   <EntityHeader.Identity
 *     name={user.name}
 *     avatarUrl={user.avatarUrl}
 *     title={<DialogTitle>{user.name}</DialogTitle>}
 *     description={<DialogDescription>{user.userId}</DialogDescription>}
 *   >
 *     <StatusBadge status={user.status} />
 *   </EntityHeader.Identity>
 *   <EntityHeader.Meta>
 *     <EntityHeader.MetaItem icon={Mail}>{user.email}</EntityHeader.MetaItem>
 *   </EntityHeader.Meta>
 * </EntityHeader>
 * ```
 */
function EntityHeaderRoot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 md:flex-row md:items-start md:justify-between",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** First letter of each word — the fallback when no avatar was uploaded. */
function initials(name: string | undefined) {
  return (name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("");
}

function Identity({
  name,
  avatarUrl,
  title,
  description,
  children,
  className,
}: {
  name?: string;
  avatarUrl?: string;
  /** Defaults to `name` when no slot is given. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Badges and anything else that sits under the name. */
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-1", className)}>
      <Avatar className="size-16 shrink-0 md:size-22.5">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="bg-muted text-xl font-bold">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      {/* Names and ids are user data of any length, so this column has to be
          allowed to shrink rather than push the contact facts off the edge. */}
      <div className="min-w-0">
        {title ?? (
          <p className="text-lg font-medium leading-4.5 text-foreground md:text-xl">
            {name}
          </p>
        )}
        {description}
        {children}
      </div>
    </div>
  );
}

/** Right-hand column of contact facts. */
function Meta({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 space-y-1.5 text-left text-sm break-words text-muted-foreground md:space-y-3 md:text-right",
        className,
      )}
    >
      {children}
    </div>
  );
}

function MetaItem({
  icon: Icon,
  children,
  className,
  iconClassName,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 md:justify-end lg:gap-2",
        className,
      )}
    >
      <Icon className={cn("size-3.5 shrink-0", iconClassName)} />
      <span>{children}</span>
    </div>
  );
}

export const EntityHeader = Object.assign(EntityHeaderRoot, {
  Identity,
  Meta,
  MetaItem,
});
