import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { AccountValidationStatus } from "@/types/user";

interface AccountValidationMessageProps {
  status: AccountValidationStatus;
  accountHolderName?: string;
  /** Why the bank refused, when it did. */
  message?: string;
}

export function AccountValidationMessage({
  status,
  accountHolderName,
  message,
}: AccountValidationMessageProps) {
  if (status === "validating") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
        <span className="loader" />
        Validating Account Number
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {accountHolderName}
      </div>
    );
  }

  // A refused account number used to render as nothing at all, which read as
  // "still checking" — the gateway's reason is the whole point of asking.
  if (status === "error") {
    return (
      <div
        role="alert"
        className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
      >
        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
        {message ?? "This account number could not be verified."}
      </div>
    );
  }

  return null;
}
