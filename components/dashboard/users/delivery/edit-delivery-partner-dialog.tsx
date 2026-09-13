"use client";

import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { useForm,  type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormStepper } from "../stepper";
import { DELIVERYSTEPS } from "@/constants/user";
import { ContactDetailsStep } from "./steps/contact-details-step";
import { DocumentsStep } from "./steps/document-step";
import { LocationStep } from "./steps/location-step";
import { ChangesSavedDialog } from "./rider-created-dialogs";
import { deliveryPartnerFormSchema } from "@/lib/validations/user";
import { toErrorMessage } from "@/lib/api/errors";
import { useAccountValidation } from "@/hooks/use-account-validation";
import type {
  DeliveryPartner,
  DeliveryPartnerFormValues,
  DeliveryPartnerStep,
} from "@/types/user";

// Mirrors DELIVERYSTEPS: Location precedes Documents because the bank list on
// the Documents step is fetched for the country chosen on Location.
const STEP_ORDER: DeliveryPartnerStep[] = ["contact", "location", "documents"];

const STEP_FIELDS: Record<
  DeliveryPartnerStep,
  (keyof DeliveryPartnerFormValues)[]
> = {
  contact: ["contactPersonName", "email", "phone", "businessName", "utrNumber"],
  documents: [
    "registrationNumber",
    "documents",
    "existingDocuments",
    "bankName",
    "bankCode",
    "bankAccountNumber",
    "verifyEmailAutomatically",
  ],
  location: [
    "country",
    "state",
    "lga",
    "region",
    "city",
    "area",
  ],
};

function valuesFromPartner(
  partner: DeliveryPartner,
): DeliveryPartnerFormValues {
  return {
    profileImage: null,
    contactPersonName: partner.contactPersonName,
    email: partner.email,
    phone: partner.phone,
    businessName: partner.organizationName,
    utrNumber: partner.utrNumber,
    registrationNumber: partner.registrationNumber,
    documents: [],
    existingDocuments: partner.documents,
    bankName: partner.bank.bankName,
    // The gateway's code is not part of the profile shape, so an edit re-picks
    // the bank rather than carrying a code the API never gave us.
    bankCode: "",
    bankAccountNumber: partner.bank.accountNumber,
    accountHolderName: partner.bank.accountHolderName,
    country: partner.location.country,
    state: partner.location.state,
    lga: partner.location.lga,
    region: partner.location.region,
    city: partner.location.city,
    area: partner.location.area,
    verifyEmailAutomatically: partner.emailVerified,
  };
}

interface EditDeliveryPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: DeliveryPartner;
  /**
   * Persists the changes. "Changes Saved" is shown only once this resolves —
   * a rejection keeps the form open with the reason under it.
   */
  onSaved: (values: DeliveryPartnerFormValues) => Promise<void>;
}

export function EditDeliveryPartnerDialog({
  open,
  onOpenChange,
  partner,
  onSaved,
}: EditDeliveryPartnerDialogProps) {
  return (
    <EditDeliveryPartnerDialogInner
      key={`${partner.id}-${String(open)}`}
      open={open}
      onOpenChange={onOpenChange}
      partner={partner}
      onSaved={onSaved}
    />
  );
}

function EditDeliveryPartnerDialogInner({
  open,
  onOpenChange,
  partner,
  onSaved,
}: EditDeliveryPartnerDialogProps) {
  const [step, setStep] = useState<DeliveryPartnerStep>("contact");
  const [showSaved, setShowSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeliveryPartnerFormValues>({
    resolver: zodResolver(deliveryPartnerFormSchema) as Resolver<DeliveryPartnerFormValues>,
    defaultValues: valuesFromPartner(partner),
    mode: "onSubmit",
  });

  const documents = watch("documents");
  const existingDocuments = watch("existingDocuments");
  const bankAccountNumber = watch("bankAccountNumber");
  const bankCode = watch("bankCode");
  const accountHolderName = watch("accountHolderName");
  const country = watch("country");
  const state = watch("state");

  const validation = useAccountValidation({
    accountNumber: bankAccountNumber,
    bankCode,
    country,
  });

  const stepIndex = STEP_ORDER.indexOf(step);
  // Derived rather than named, so reordering the steps cannot leave the form
  // submitting from the middle of the wizard.
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

  function goBack() {
    if (stepIndex === 0) return;
    setStep(STEP_ORDER[stepIndex - 1]);
  }

  async function onSubmit(values: DeliveryPartnerFormValues) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSaved({
        ...values,
        accountHolderName: validation.accountName ?? values.accountHolderName,
      });
    } catch (error) {
      setSubmitError(toErrorMessage(error));
      return;
    } finally {
      setIsSubmitting(false);
    }
    setShowSaved(true);
  }

  return (
    <>
      <Dialog open={open && !showSaved} onOpenChange={onOpenChange}>
        <DialogContent showCloseButton={false} className="max-w-md gap-6 p-6">
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={goBack}
                aria-label="Back"
                className="text-neutral-500"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="flex-1 text-base font-semibold text-neutral-900">
              Edit Delivery Partner
            </h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close"
              className="text-neutral-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* The shared list, not a copy — the two dialogs walk the same steps
              in the same order. */}
          <FormStepper STEPS={DELIVERYSTEPS} current={step} />

          <div className="max-h-[60vh] overflow-y-auto pr-1">
            {step === "contact" && (
              <ContactDetailsStep
                control={control}
                errors={errors}
                existingImageUrl={partner.profileImageUrl}
              />
            )}
            {step === "documents" && (
              <DocumentsStep
                control={control}
                errors={errors}
                setValue={setValue}
                documents={documents}
                existingDocuments={existingDocuments}
                country={country}
                validation={validation}
                accountHolderName={accountHolderName}
              />
            )}
            {step === "location" && (
              <LocationStep
                control={control}
                errors={errors}
                setValue={setValue}
                country={country}
                state={state}
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
              variant="outline"
              className="flex-1"
              onClick={() => (stepIndex === 0 ? onOpenChange(false) : goBack())}
              disabled={isSubmitting}
            >
              {stepIndex === 0 ? "Cancel" : "Back"}
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={goNext}
              isLoading={isSubmitting}
            >
              {isLastStep ? "Save Changes" : "Continue"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ChangesSavedDialog
        open={showSaved}
        onOpenChange={(next) => {
          if (!next) {
            setShowSaved(false);
            onOpenChange(false);
          }
        }}
        organizationName={partner.organizationName}
        logoUrl={partner.profileImageUrl}
      />
    </>
  );
}
