import { CheckCircle2 } from "lucide-react";
import type { AccountValidationStatus } from "@/types/user";

interface AccountValidationMessageProps {
  status: AccountValidationStatus;
  accountHolderName?: string;
}

export function AccountValidationMessage({
  status,
  accountHolderName,
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

  return null;
}