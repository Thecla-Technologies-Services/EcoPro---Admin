"use client";

import { Controller } from "react-hook-form";

import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";
import { FloatingSelect } from "@/components/shared/form/floating-select";
import { DocumentUpload } from "@/components/shared/form/document-upload";
import { Switch } from "@/components/ui/switch";

import { AccountValidationMessage } from "../account-validation-message";

import { useBanks } from "@/hooks/admin/use-delivery-partners";
import type { AccountValidation } from "@/hooks/use-account-validation";

import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";

import type { Country } from "@/types/api/admin";
import type { DeliveryPartnerFormValues } from "@/types/user";

interface DocumentsStepProps {
  control: Control<DeliveryPartnerFormValues>;
  errors: FieldErrors<DeliveryPartnerFormValues>;
  setValue: UseFormSetValue<DeliveryPartnerFormValues>;

  documents: File[];
  existingDocuments: DeliveryPartnerFormValues["existingDocuments"];

  /** From the location step, which the bank list needs. */
  country: Country;
  /** What the gateway made of the account number, from the dialog. */
  validation: AccountValidation;
  /** The holder name already on file, shown until the gateway answers. */
  accountHolderName?: string;
}

export function DocumentsStep({
  control,
  errors,
  setValue,
  documents,
  existingDocuments,
  country,
  validation,
  accountHolderName,
}: DocumentsStepProps) {
  const banks = useBanks(country);

  // Names are what the admin picks from; the gateway's code is what the create
  // body and the account resolution both take, so both are stored.
  const bankOptions = (banks.data ?? []).flatMap((bank) =>
    bank.name && bank.code ? [{ value: bank.code, label: bank.name }] : [],
  );

  const handleAddFiles = (files: File[]) => {
    setValue("documents", [...documents, ...files], {
      shouldValidate: true,
    });
  };

  const handleRemoveNewFile = (index: number) => {
    setValue(
      "documents",
      documents.filter((_, i) => i !== index),
      {
        shouldValidate: true,
      },
    );
  };

  const handleRemoveExistingDocument = (id: string) => {
    setValue(
      "existingDocuments",
      existingDocuments.filter((doc) => doc.id !== id),
      {
        shouldValidate: true,
      },
    );
  };

  return (
    <div className="space-y-5">
      {/* CAC Registration Number */}
      <Controller
        control={control}
        name="registrationNumber"
        render={({ field }) => (
          <FloatingLabelInput
            {...field}
            label="Registration Number (CAC)"
            placeholder="CAC/IT/12333"
            error={errors.registrationNumber?.message}
          />
        )}
      />

      {/* Documents */}
      <DocumentUpload
        newFiles={documents}
        existingDocuments={existingDocuments}
        onAddFiles={handleAddFiles}
        onRemoveNewFile={handleRemoveNewFile}
        onRemoveExistingDocument={handleRemoveExistingDocument}
        error={errors.documents?.message as string | undefined}
      />

      {/* Bank — the gateway's list for the chosen country, not a fixed one */}
      <Controller
        control={control}
        name="bankCode"
        render={({ field }) => (
          <FloatingSelect
            label="Bank Name"
            options={bankOptions}
            value={field.value}
            onChange={(code) => {
              field.onChange(code);
              setValue(
                "bankName",
                bankOptions.find((option) => option.value === code)?.label ??
                  "",
                { shouldValidate: true },
              );
            }}
            disabled={banks.isPending || bankOptions.length === 0}
            error={
              banks.isError
                ? "Could not load the bank list. Try again."
                : (errors.bankCode?.message ?? errors.bankName?.message)
            }
          />
        )}
      />

      {/* Account Number */}
      <Controller
        control={control}
        name="bankAccountNumber"
        render={({ field }) => (
          <FloatingLabelInput
            {...field}
            label="Bank Account Number"
            placeholder="0012762345"
            inputMode="numeric"
            maxLength={10}
            error={errors.bankAccountNumber?.message}
          />
        )}
      />

      {/* Validation Status */}
      <AccountValidationMessage
        status={validation.status}
        accountHolderName={validation.accountName ?? accountHolderName}
        message={validation.message}
      />

      {/* Auto Verify Email */}
      <Controller
        control={control}
        name="verifyEmailAutomatically"
        render={({ field }) => (
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-neutral-600">
              Verify Email Automatically
            </span>

            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />
    </div>
  );
}
