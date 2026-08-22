"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * The scrolling, sectioned dialog used to inspect one record — a verification
 * application, a withdrawal request, an order.
 *
 * The shell owns the parts that are fiddly and identical everywhere: a body that
 * scrolls inside a capped height, hairlines between sections, and a footer that
 * stays pinned while the body moves. Sections are children, so each module
 * decides what it shows and in what order.
 *
 * ```tsx
 * <DetailDialog open={open} onOpenChange={setOpen}>
 *   <DetailDialog.Section padded>{header}</DetailDialog.Section>
 *   <DetailDialog.Section title="Bank Accounts" when={!!bank}>
 *     <DetailList boxed>…</DetailList>
 *   </DetailDialog.Section>
 *   <DetailDialog.Footer>
 *     <Button>Approve</Button>
 *   </DetailDialog.Footer>
 * </DetailDialog>
 * ```
 */
function DetailDialogRoot({
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
        showCloseButton={false}
        className={cn(
          "max-w-2xl! flex max-h-[85vh] flex-col gap-0 overflow-hidden bg-background p-0",
          className,
        )}
      >
        <DialogClose className="absolute right-4 top-4 z-10 text-muted-foreground hover:text-foreground" />
        <div className="flex h-full flex-col overflow-y-auto">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

interface SectionProps {
  /**
   * Renders nothing when false — lets a caller list every possible section and
   * let the data decide, instead of wrapping each one in `&&`.
   */
  when?: boolean;
  title?: React.ReactNode;
  children: React.ReactNode;
  /** Drops the trailing hairline, e.g. on the last section before the footer. */
  divided?: boolean;
  className?: string;
}

function Section({
  when = true,
  title,
  children,
  divided = true,
  className,
}: SectionProps) {
  if (!when) return null;

  return (
    <>
      <div className={cn("px-3 py-4 lg:px-4 lg:py-5", className)}>
        {title && (
          <h3 className="mb-4 text-lg font-semibold text-foreground md:text-xl">
            {title}
          </h3>
        )}
        {children}
      </div>
      {divided && <hr className="border-border" />}
    </>
  );
}

/** Pinned action bar. Buttons stretch on mobile and sit right-aligned above it. */
function Footer({
  when = true,
  children,
  className,
}: {
  when?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  if (!when) return null;

  return (
    <div
      className={cn(
        "sticky bottom-0 flex gap-3 border-t border-border bg-background p-3 md:justify-end md:p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

export const DetailDialog = Object.assign(DetailDialogRoot, {
  Section,
  Footer,
});
