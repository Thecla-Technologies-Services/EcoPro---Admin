"use client";

import { Controller } from "react-hook-form";

import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";
import { FloatingSelect } from "@/components/shared/form/floating-select";
import { DocumentUpload } from "@/components/shared/form/document-upload";

import { AccountValidationMessage } from "../account-validation-message";

import { NIGERIAN_BANKS } from "@/constants/user";
import { useAccountValidation } from "@/hooks/use-account-validation";

import type { Control, FieldErrors, UseFormSetValue } from "react-hook-form";

import type {
  AccountValidationStatus,
  DeliveryPartnerFormValues,
} from "@/types/user";

interface DocumentsStepProps {
  control: Control<DeliveryPartnerFormValues>;
  errors: FieldErrors<DeliveryPartnerFormValues>;
  setValue: UseFormSetValue<DeliveryPartnerFormValues>;

  documents: File[];
  existingDocuments: DeliveryPartnerFormValues["existingDocuments"];

  bankAccountNumber: string;

  validationStatus: AccountValidationStatus;

  accountHolderName?: string;

  onValidationStatusChange: (
    status: AccountValidationStatus,
    holderName?: string,
  ) => void;
}

export function DocumentsStep({
  control,
  errors,
  setValue,
  documents,
  existingDocuments,
  bankAccountNumber,
  validationStatus,
  accountHolderName,
  onValidationStatusChange,
}: DocumentsStepProps) {
  useAccountValidation(bankAccountNumber, onValidationStatusChange);

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

      {/* Bank */}
      <Controller
        control={control}
        name="bankName"
        render={({ field }) => (
          <FloatingSelect
            label="Bank Name"
            options={NIGERIAN_BANKS}
            value={field.value}
            onChange={field.onChange}
            error={errors.bankName?.message}
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
        status={validationStatus}
        accountHolderName={accountHolderName}
      />
    </div>
  );
}
