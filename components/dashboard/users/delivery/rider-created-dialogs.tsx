"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { CreatedRiderCredentials } from "@/types/user";

export function RiderCreatedAutoVerifyDialog({
  open,
  onOpenChange,
  logoUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logoUrl?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0">
          <Avatar className="w-full h-full">
            <AvatarImage src={logoUrl} alt={logoUrl} />
            <AvatarFallback className="bg-gray-200 w-full h-full">
              GL
            </AvatarFallback>
          </Avatar>
        </div>
        <h2 className="text-lg font-semibold text-neutral-900">
          Rider Account Created Successfully
        </h2>
        <p className="text-sm text-neutral-500">
          The login credentials containing the username and password have been
          sent to the rider&apos;s email address.
        </p>
        <Button
          className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700"
          onClick={() => onOpenChange(false)}
        >
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}


export function RiderCreatedManualVerifyDialog({
  open,
  onOpenChange,
  logoUrl,
  credentials,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  logoUrl?: string;
  credentials: CreatedRiderCredentials;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0">
          <Avatar className="w-full h-full">
            <AvatarImage src={logoUrl} alt={logoUrl} />
            <AvatarFallback className="bg-gray-200 w-full h-full">
              GL
            </AvatarFallback>
          </Avatar>
        </div>
        <h2 className="text-lg font-semibold text-neutral-900">
          Rider Account Created Successfully
        </h2>
        <p className="text-sm text-neutral-500">
          Please share the login credentials below with the rider.
        </p>

        <div className="space-y-3 rounded-lg bg-neutral-50 p-4 text-left">
          <div>
            <p className="text-xs text-neutral-400">Email address</p>
            <p className="text-sm font-medium text-neutral-900">
              {credentials.email}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-400">Password</p>
            <p className="text-sm font-medium text-neutral-900">
              {credentials.password}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            navigator.clipboard.writeText(
              `Email: ${credentials.email}\nPassword: ${credentials.password}`,
            );
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copied" : "Copy credentials"}
        </Button>

        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          onClick={() => onOpenChange(false)}
        >
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function ChangesSavedDialog({
  open,
  onOpenChange,
  organizationName,
  logoUrl,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationName: string;
  logoUrl?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 shrink-0">
          <Avatar className="w-full h-full">
            <AvatarImage src={logoUrl} alt={organizationName} />
            <AvatarFallback className="bg-gray-200 w-full h-full">
              {organizationName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>

        <h2 className="text-lg font-semibold text-neutral-900">
          Changes Saved Successfully
        </h2>
        <p className="text-sm text-neutral-500">
          The profile for {organizationName} has been updated successfully.
        </p>
        <Button
          className="mt-2 w-full bg-emerald-600 hover:bg-emerald-700"
          onClick={() => onOpenChange(false)}
        >
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}
