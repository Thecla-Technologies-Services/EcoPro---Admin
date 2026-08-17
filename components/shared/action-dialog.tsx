"use client";

import * as React from "react";
import Image from "next/image";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

/**
 * The small "are you sure / it's done" dialog, as composable parts.
 *
 * Every module has a handful of these — approve, reject, suspend, delete,
 * publish — and they differ only in copy, in whether they show a form, and in
 * which buttons the current step needs. Composing them keeps one dialog shell
 * and lets each flow write its own steps, instead of a shell that grows a prop
 * per variation.
 *
 * ```tsx
 * const approve = useAsyncAction(onApprove);
 *
 * <ActionDialog open={open} onOpenChange={close}>
 *   {approve.isSuccess ? (
 *     <>
 *       <ActionDialog.Media />
 *       <ActionDialog.Title>Verification Approved</ActionDialog.Title>
 *       <ActionDialog.Description>{…}</ActionDialog.Description>
 *       <ActionDialog.Actions>
 *         <ActionDialog.Done onClick={close} />
 *       </ActionDialog.Actions>
 *     </>
 *   ) : (
 *     <>
 *       <ActionDialog.Title>Approve Verification</ActionDialog.Title>
 *       <ActionDialog.Error error={approve.error} />
 *       <ActionDialog.Actions>
 *         <ActionDialog.Cancel onClick={close} disabled={approve.isLoading} />
 *         <ActionDialog.Confirm onClick={approve.run} isLoading={approve.isLoading}>
 *           Yes, Approve
 *         </ActionDialog.Confirm>
 *       </ActionDialog.Actions>
 *     </>
 *   )}
 * </ActionDialog>
 * ```
 *
 * For the plain confirm/success shape, `ConfirmActionDialog` wraps this up as a
 * single prop-driven component.
 */
function ActionDialogRoot({
  open,
  onOpenChange,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-w-xs gap-0 px-4 py-4 md:max-w-sm md:py-6", className)}
      >
        <DialogClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground" />
        {children}
      </DialogContent>
    </Dialog>
  );
}

const media = {
  confirmed: "/assets/images/check-circle.gif",
  user: "/assets/images/avatar.gif",
} as const;

/** The animated mark above the copy. */
function Media({
  kind = "confirmed",
  className,
}: {
  kind?: keyof typeof media;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex justify-start", className)}>
      <Image src={media[kind]} alt="" width={90} height={90} />
    </div>
  );
}

function Title({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DialogTitle className={cn("mb-2 text-lg font-semibold", className)}>
      {children}
    </DialogTitle>
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
    <DialogDescription
      className={cn("mb-6 text-sm text-muted-foreground", className)}
    >
      {children}
    </DialogDescription>
  );
}

/**
 * Renders nothing until the action actually fails, so a flow can leave it in
 * place unconditionally.
 */
function ErrorMessage({
  error,
  className,
}: {
  error: unknown;
  className?: string;
}) {
  if (!error) return null;

  return (
    <p
      role="alert"
      className={cn("mb-4 text-sm text-destructive", className)}
    >
      {toErrorMessage(error)}
    </p>
  );
}

function Actions({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex gap-2", className)}>{children}</div>;
}

type PresetButtonProps = React.ComponentProps<typeof Button>;

function Cancel({ children = "Cancel", className, ...props }: PresetButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn("flex-1 rounded-full", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

function Confirm({ children, className, ...props }: PresetButtonProps) {
  return (
    <Button
      className={cn(
        "flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

/** Destructive twin of `Confirm`, dimmed until the flow can be submitted. */
function Destructive({ children, className, ...props }: PresetButtonProps) {
  return (
    <Button
      className={cn(
        "flex-1 rounded-full bg-destructive text-white transition-all hover:bg-destructive/90 disabled:bg-destructive/30 disabled:opacity-100",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

/** Full-width dismissal for a success step. */
function Done({ children = "Done", className, ...props }: PresetButtonProps) {
  return (
    <Button
      className={cn(
        "w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

export const ActionDialog = Object.assign(ActionDialogRoot, {
  Media,
  Title,
  Description,
  Error: ErrorMessage,
  Actions,
  Cancel,
  Confirm,
  Destructive,
  Done,
});
