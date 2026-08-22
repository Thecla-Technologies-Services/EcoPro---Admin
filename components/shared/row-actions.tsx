"use client";

import * as React from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * The kebab menu in a table's last column, and the one beside a page's primary
 * button.
 *
 * Items are children so a row can hide the ones it isn't allowed to offer —
 * a locked system role, an already-suspended user — instead of the menu
 * accepting an array of items with a `visible` flag on each.
 *
 * ```tsx
 * <RowActions>
 *   <RowActions.Item icon={IoEyeOutline} onSelect={() => open(role, "view")}>
 *     View Role
 *   </RowActions.Item>
 *   {role.isEditable && (
 *     <RowActions.Item icon={IoTrashBinOutline} destructive onSelect={remove}>
 *       Delete Role
 *     </RowActions.Item>
 *   )}
 * </RowActions>
 * ```
 */
function RowActionsRoot({
  children,
  trigger,
  align = "end",
  className,
  contentClassName,
}: {
  children: React.ReactNode;
  /** Replaces the kebab button entirely. */
  trigger?: React.ReactNode;
  align?: "start" | "center" | "end";
  className?: string;
  contentClassName?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open actions"
            className={cn("h-8 w-8 rounded-md bg-background", className)}
          >
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn(
          "w-44 justify-start gap-3 rounded-md p-3 md:w-56",
          contentClassName,
        )}
      >
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Item({
  icon: Icon,
  onSelect,
  destructive,
  children,
  className,
  asChild,
  ...props
}: {
  icon?: React.ElementType;
  onSelect?: () => void;
  destructive?: boolean;
  children: React.ReactNode;
  className?: string;
} & Omit<
  React.ComponentProps<typeof DropdownMenuItem>,
  "onSelect" | "children" | "className"
>) {
  return (
    <DropdownMenuItem
      className={cn(
        "rounded-sm",
        destructive && "text-destructive focus:text-destructive",
        className,
      )}
      onClick={onSelect}
      asChild={asChild}
      {...props}
    >
      {/* `asChild` hands the child straight to Radix's Slot, which takes exactly
          one element — so the icon slot cannot be rendered alongside it. An
          `asChild` caller draws its own icon inside the element it passes. */}
      {asChild ? (
        children
      ) : (
        <>
          {Icon && <Icon className="mr-2 size-4 md:size-5" />}
          {children}
        </>
      )}
    </DropdownMenuItem>
  );
}

export const RowActions = Object.assign(RowActionsRoot, { Item });
