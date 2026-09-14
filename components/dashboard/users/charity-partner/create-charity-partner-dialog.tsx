"use client";

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormStepper } from "../stepper";
import { CharityPartnerContactDetailsStep } from "./steps/contact-details-step";
import { CharityPartnerDocumentsStep } from "./steps/documents-step";
import { charityPartnerFormSchema } from "@/lib/validations/user";
import { CHARITY_PARTNER_STEPS } from "@/constants/user";
import { toErrorMessage } from "@/lib/api/errors";
import { OrganizationCreatedDialog } from "./organization-created-dialog";
import type { CharityPartnerFormValues, CharityPartnerStep } from "@/types/user";

const STEP_ORDER: CharityPartnerStep[] = ["contact", "documents"];

const STEP_FIELDS: Record<CharityPartnerStep, (keyof CharityPartnerFormValues)[]> = {
  contact: [
    "organisationName",
    "contactPersonName",
    "contactEmail",
    "contactPhone",
  ],
  documents: [
    "registrationNumber",
    "organizationAddress",
    "postalCode",
    "documents",
    "existingDocuments",
  ],
};

const DEFAULT_VALUES: CharityPartnerFormValues = {
  profileImage: null,
  organisationName: "",
  contactPersonName: "",
  contactEmail: "",
  contactPhone: "",
  registrationNumber: "",
  organizationAddress: "",
  postalCode: "",
  documents: [],
  existingDocuments: [],
};

interface CreateCharityPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Persists the organisation. The success dialog is shown only once this
   * resolves — a rejection keeps the form on its last step and puts the reason
   * under it, rather than reporting a Charity Partner that was never created.
   */
  onCreated: (values: CharityPartnerFormValues) => Promise<void>;
}

export function CreateCharityPartnerDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateCharityPartnerDialogProps) {
  // Remounting on open resets the step and every field without a manual reset.
  return (
    <CreateCharityPartnerDialogInner
      key={String(open)}
      open={open}
      onOpenChange={onOpenChange}
      onCreated={onCreated}
    />
  );
}

function CreateCharityPartnerDialogInner({
  open,
  onOpenChange,
  onCreated,
}: CreateCharityPartnerDialogProps) {
  const [step, setStep] = useState<CharityPartnerStep>("contact");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CharityPartnerFormValues>({
    resolver: zodResolver(charityPartnerFormSchema) as Resolver<CharityPartnerFormValues>,
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
      handleSubmit(onSubmit)();
      return;
    }
    setStep(STEP_ORDER[stepIndex + 1]);
  }

  async function onSubmit(values: CharityPartnerFormValues) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onCreated(values);
    } catch (error) {
      setSubmitError(toErrorMessage(error));
      return;
    } finally {
      setIsSubmitting(false);
    }
    setCreated(true);
  }

  function goBack() {
    if (stepIndex === 0) return;
    setSubmitError(null);
    setStep(STEP_ORDER[stepIndex - 1]);
  }

  return (
    <>
    <Dialog open={open && !created} onOpenChange={onOpenChange}>
      {/* 580px wide, per the Create Charity Partner frame. The `sm:` prefix is what beats
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
            Create Charity Partner
          </DialogTitle>
          <DialogClose className="text-muted-foreground hover:text-foreground" />
        </div>

        {/* Radix warns when a dialog has no description; the steps are on
            screen, so this is for screen readers only. */}
        <DialogDescription className="sr-only">
          Create a Charity Partner in two steps: contact details, then
          verification documents.
        </DialogDescription>

        <div className="space-y-6 px-6 py-5">
          <FormStepper STEPS={CHARITY_PARTNER_STEPS} current={step} />

          <div className="max-h-[55vh] overflow-y-auto pr-1">
            {step === "contact" && (
              <CharityPartnerContactDetailsStep control={control} errors={errors} />
            )}
            {step === "documents" && (
              <CharityPartnerDocumentsStep
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
              disabled={isSubmitting}
            >
              {stepIndex === 0 ? "Cancel" : "Back"}
            </Button>
            <Button
              className="flex-1 rounded-full bg-primary text-white"
              onClick={goNext}
              isLoading={isSubmitting}
            >
              {isLastStep ? "Create Charity Partner" : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <OrganizationCreatedDialog
      open={created}
      onOpenChange={(next) => {
        if (!next) {
          setCreated(false);
          onOpenChange(false);
        }
      }}
      organizationName={watch("organisationName")}
    />
    </>
  );
}
