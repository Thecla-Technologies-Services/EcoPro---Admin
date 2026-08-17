"use client";

import { useEffect, useRef } from "react";
import type { AccountValidationStatus } from "@/types/user";

export function useAccountValidation(
  accountNumber: string,
  onStatusChange: (
    status: AccountValidationStatus,
    holderName?: string
  ) => void,
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!/^[0-9]{10}$/.test(accountNumber)) {
      onStatusChange("idle");
      return;
    }

    onStatusChange("validating");

    timeoutRef.current = setTimeout(() => {
      // Replace this with your API call
      onStatusChange("success", "Samuel Anderson");
    }, 1200);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [accountNumber, onStatusChange]);
}