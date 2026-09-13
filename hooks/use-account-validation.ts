"use client";

import { useResolvedBankAccount } from "@/hooks/admin/use-delivery-partners";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { toErrorMessage } from "@/lib/api/errors";
import type { Country } from "@/types/api/admin";
import type { AccountValidationStatus } from "@/types/user";

interface AccountValidationInput {
  accountNumber: string;
  /** The gateway's bank code, not the bank's name. */
  bankCode: string;
  country: Country;
}

export interface AccountValidation {
  status: AccountValidationStatus;
  /** The name the bank holds for the account, once it has answered. */
  accountName?: string;
  /** Why the bank refused, when it did. */
  message?: string;
}

/**
 * Checks a bank account number against the bank and reports the name it holds.
 *
 * Three things have to be in hand before the gateway can be asked — a ten-digit
 * account number, the bank's code and the country — so an incomplete form sits
 * at `idle` rather than firing a request that would only come back refused.
 *
 * A refusal is a result, not a failure: `resolve-account` answers 200 with
 * `success: false` when the bank does not recognise the account, so that lands
 * on `error` with the gateway's own message alongside genuine request failures.
 *
 * The outcome is returned rather than pushed through a callback. An earlier
 * version reported it by calling back from an effect, which meant the form's
 * account-holder field was written to during render — and a stale name could
 * outlive the account number it belonged to.
 */
export function useAccountValidation({
  accountNumber,
  bankCode,
  country,
}: AccountValidationInput): AccountValidation {
  // Typing a ten-digit account number would otherwise ask the gateway ten
  // times, once per keystroke past the first.
  const debouncedNumber = useDebouncedValue(accountNumber);
  const complete = /^[0-9]{10}$/.test(debouncedNumber) && Boolean(bankCode);

  const { data, isFetching, isError, error } = useResolvedBankAccount(
    complete ? { accountNumber: debouncedNumber, bankCode, country } : {}
  );

  if (!complete) return { status: "idle" };
  if (isFetching) return { status: "validating" };
  if (isError) return { status: "error", message: toErrorMessage(error) };
  if (!data) return { status: "idle" };

  if (data.success && data.accountName) {
    return { status: "success", accountName: data.accountName };
  }

  return {
    status: "error",
    message: data.message ?? "The bank did not recognise this account number.",
  };
}
