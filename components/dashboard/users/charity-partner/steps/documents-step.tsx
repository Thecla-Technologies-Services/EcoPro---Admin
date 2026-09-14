"use client";

import { MapPin, Mailbox, FileText } from "lucide-react";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormSetValue,
} from "react-hook-form";
import type { CharityPartnerFormValues } from "@/types/user";
import { FloatingLabelInput } from "@/components/shared/form/floating-label-input";
import { DocumentUpload } from "@/components/shared/form/document-upload";

interface DocumentsStepProps {
  control: Control<CharityPartnerFormValues>;
  errors: FieldErrors<CharityPartnerFormValues>;
  setValue: UseFormSetValue<CharityPartnerFormValues>;
  documents: File[];
  existingDocuments: CharityPartnerFormValues["existingDocuments"];
}

export function CharityPartnerDocumentsStep({
  control,
  errors,
  setValue,
  documents,
  existingDocuments,
}: DocumentsStepProps) {
  return (
    <div className="space-y-5">
      {/* Required by the create endpoint, so the form has to ask for it */}
      <Controller
        control={control}
        name="registrationNumber"
        render={({ field }) => (
          <FloatingLabelInput
            label="Registration Number (CAC)"
            placeholder="CAC/IT/12333"
            icon={<FileText className="size-5" />}
            error={errors.registrationNumber?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="organizationAddress"
        render={({ field }) => (
          <FloatingLabelInput
            label="Organisation Address"
            icon={<MapPin className="size-5" />}
            error={errors.organizationAddress?.message}
            {...field}
          />
        )}
      />

      <Controller
        control={control}
        name="postalCode"
        render={({ field }) => (
          <FloatingLabelInput
            label="Postal Code"
            icon={<Mailbox className="size-5" />}
            error={errors.postalCode?.message}
            {...field}
          />
        )}
      />

      <DocumentUpload
        newFiles={documents}
        existingDocuments={existingDocuments}
        onAddFiles={(files) =>
          setValue("documents", [...documents, ...files], {
            shouldValidate: true,
          })
        }
        onRemoveNewFile={(index) =>
          setValue(
            "documents",
            documents.filter((_, i) => i !== index),
            { shouldValidate: true },
          )
        }
        onRemoveExistingDocument={(id) =>
          setValue(
            "existingDocuments",
            existingDocuments.filter((doc) => doc.id !== id),
            { shouldValidate: true },
          )
        }
        error={errors.documents?.message as string | undefined}
      />
    </div>
  );
}
