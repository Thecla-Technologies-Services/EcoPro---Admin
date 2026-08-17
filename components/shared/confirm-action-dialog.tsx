"use client";

import * as React from "react";
import { ActionDialog } from "@/components/shared/action-dialog";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  iconClassName?: string;
  /** The action buttons, laid out in a row. */
  children: React.ReactNode;
  className?: string;
  /** Which animated mark to show above the copy. */
  status?: "confirmed" | "user";
}

/**
 * Mark, title, description, buttons — the shape most confirm dialogs need,
 * without spelling out the parts.
 *
 * Reach for `ActionDialog` directly when a flow needs more than this: extra
 * steps, a form between the copy and the buttons, or an inline error.
 */
export function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  status = "confirmed",
  className,
}: ConfirmActionDialogProps) {
  return (
    <ActionDialog open={open} onOpenChange={onOpenChange} className={className}>
      <ActionDialog.Media kind={status} />
      <ActionDialog.Title>{title}</ActionDialog.Title>
      <ActionDialog.Description>{description}</ActionDialog.Description>
      <ActionDialog.Actions>{children}</ActionDialog.Actions>
    </ActionDialog>
  );
}
