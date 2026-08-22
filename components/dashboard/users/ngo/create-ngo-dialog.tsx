"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormStepper } from "../stepper";
import { NGOContactDetailsStep } from "./steps/contact-details-step";
import { NGODocumentsStep } from "./steps/documents-step";
import { ngoFormSchema } from "@/lib/validations/user";
import { NGOSTEPS } from "@/constants/user";
import type { NgoFormValues, NgoStep } from "@/types/user";

const STEP_ORDER: NgoStep[] = ["contact", "documents"];

const STEP_FIELDS: Record<NgoStep, (keyof NgoFormValues)[]> = {
  contact: [
    "organisationName",
    "contactPersonName",
    "contactEmail",
    "contactPhone",
  ],
  documents: [
    "organizationAddress",
    "postalCode",
    "documents",
    "existingDocuments",
  ],
};

const DEFAULT_VALUES: NgoFormValues = {
  profileImage: null,
  organisationName: "",
  contactPersonName: "",
  contactEmail: "",
  contactPhone: "",
  organizationAddress: "",
  postalCode: "",
  documents: [],
  existingDocuments: [],
};

/**
 * The Admin API has no endpoint that creates an organisation — it only reads
 * the ones awaiting verification — so the form validates and then says so
 * rather than reporting an NGO that was never created.
 */
const NO_ENDPOINT_MESSAGE =
  "NGO accounts cannot be created yet — the admin API has no create-organisation endpoint. The details above were not saved.";

interface CreateNgoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateNgoDialog({ open, onOpenChange }: CreateNgoDialogProps) {
  // Remounting on open resets the step and every field without a manual reset.
  return (
    <CreateNgoDialogInner
      key={String(open)}
      open={open}
      onOpenChange={onOpenChange}
    />
  );
}

function CreateNgoDialogInner({ open, onOpenChange }: CreateNgoDialogProps) {
  const [step, setStep] = useState<NgoStep>("contact");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NgoFormValues>({
    resolver: zodResolver(ngoFormSchema) as Resolver<NgoFormValues>,
    defaultValues: DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const documents = watch("documents");
  const existingDocuments = watch("existingDocuments");

  const stepIndex = STEP_ORDER.indexOf(step);
  const isLastStep = stepIndex === STEP_ORDER.length - 1;

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) return;

    if (isLastStep) {
      handleSubmit(() => setSubmitError(NO_ENDPOINT_MESSAGE))();
      return;
    }
    setStep(STEP_ORDER[stepIndex + 1]);
  }

  function goBack() {
    if (stepIndex === 0) return;
    setSubmitError(null);
    setStep(STEP_ORDER[stepIndex - 1]);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* 580px wide, per the Create NGO frame. The `sm:` prefix is what beats
          DialogContent's own `sm:max-w-sm` default. */}
      <DialogContent
        showCloseButton={false}
        className="gap-0 overflow-hidden p-0 sm:max-w-[580px]"
      >
        <div className="flex items-center gap-2 border-b border-border px-6 py-5">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={goBack}
              aria-label="Back"
              className="text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
          <DialogTitle className="text-lg font-semibold">
            Create NGO
          </DialogTitle>
          <DialogClose className="text-muted-foreground hover:text-foreground" />
        </div>

        <div className="space-y-6 px-6 py-5">
          <FormStepper STEPS={NGOSTEPS} current={step} />

          <div className="max-h-[55vh] overflow-y-auto pr-1">
            {step === "contact" && (
              <NGOContactDetailsStep control={control} errors={errors} />
            )}
            {step === "documents" && (
              <NGODocumentsStep
                control={control}
                errors={errors}
                setValue={setValue}
                documents={documents}
                existingDocuments={existingDocuments}
              />
            )}
          </div>

          {submitError && (
            <p role="alert" className="text-sm text-destructive">
              {submitError}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1 rounded-full"
              onClick={() => (stepIndex === 0 ? onOpenChange(false) : goBack())}
            >
              {stepIndex === 0 ? "Cancel" : "Back"}
            </Button>
            <Button
              className="flex-1 rounded-full bg-primary text-white"
              onClick={goNext}
            >
              {isLastStep ? "Create NGO" : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
