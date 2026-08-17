"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogClose, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  iconClassName?: string;
  children: React.ReactNode;
  className?: string;
  status?: "confirmed" | "user";
}

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-xs md:max-w-sm gap-0 py-4 md:py-6 px-4",
          className,
        )}
      >
        <DialogClose className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
      
        </DialogClose>

        <div className="flex justify-start mb-5">
          <Image
            src={
              status === "confirmed"
                ? "/assets/images/check-circle.gif"
                : "/assets/images/avatar.gif"
            }
            alt="Success"
            width={90}
            height={90}
          />
        </div>

        <DialogTitle className="text-lg font-semibold mb-2">{title}</DialogTitle>
        <DialogDescription className="text-sm text-muted-foreground mb-6">
          {description}
        </DialogDescription>

        <div className="flex gap-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}
