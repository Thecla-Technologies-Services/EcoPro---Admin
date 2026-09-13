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
import { ContactDetailsStep } from "./steps/contact-details-step";
import { DocumentsStep } from "./steps/document-step";
import { LocationStep } from "./steps/location-step";
import {
  RiderCreatedAutoVerifyDialog,
  RiderCreatedManualVerifyDialog,
} from "./rider-created-dialogs";
import { deliveryPartnerFormSchema } from "@/lib/validations/user";
import { toErrorMessage } from "@/lib/api/errors";
import { useAccountValidation } from "@/hooks/use-account-validation";
import { DELIVERYSTEPS } from "@/constants/user";
import type { DeliveryPartnerCreatedResponseDto } from "@/types/api/admin";
import type {
  CreatedRiderCredentials,
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
  location: ["country", "state", "lga", "region", "city", "area"],
};

const DEFAULT_VALUES: DeliveryPartnerFormValues = {
  profileImage: null,
  contactPersonName: "",
  email: "",
  phone: "",
  businessName: "",
  utrNumber: "",
  registrationNumber: "",
  documents: [],
  existingDocuments: [],
  bankName: "",
  bankCode: "",
  bankAccountNumber: "",
  accountHolderName: undefined,
  country: "Nigeria",
  state: undefined,
  lga: undefined,
  region: undefined,
  city: "",
  area: "",
  verifyEmailAutomatically: true,
};

/**
 * What creating a partner produced.
 *
 * The create endpoint takes no documents — they go up one at a time against the
 * new account through `upload-document` — so the two can succeed separately.
 * A partner created without its documents is still created, and reporting that
 * as a failed submit would be wrong; `failedDocuments` is how the success
 * dialog says which ones did not make it.
 */
export interface DeliveryPartnerCreatedResult {
  response: DeliveryPartnerCreatedResponseDto;
  failedDocuments?: string[];
}

interface CreateDeliveryPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Persists the partner. The success dialogs are shown only once this
   * resolves — a rejection keeps the form on its last step and puts the
   * reason under it, rather than announcing a rider that was never created.
   *
   * Which success dialog to show is the API's answer, not the form's: it
   * reports whether it emailed the credentials and, when it did not, the
   * password it issued. So the response is returned rather than discarded.
   */
  onCreated: (
    values: DeliveryPartnerFormValues,
  ) => Promise<DeliveryPartnerCreatedResult>;
}

export function CreateDeliveryPartnerDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateDeliveryPartnerDialogProps) {
  return (
    <CreateDeliveryPartnerDialogInner
      key={String(open)}
      open={open}
      onOpenChange={onOpenChange}
      onCreated={onCreated}
    />
  );
}

function CreateDeliveryPartnerDialogInner({
  open,
  onOpenChange,
  onCreated,
}: CreateDeliveryPartnerDialogProps) {
  const [step, setStep] = useState<DeliveryPartnerStep>("contact");
  const [successStage, setSuccessStage] = useState<"none" | "auto" | "manual">(
    "none",
  );
  const [credentials, setCredentials] =
    useState<CreatedRiderCredentials | null>(null);
  const [documentWarning, setDocumentWarning] = useState<string>();
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
    resolver: zodResolver(
      deliveryPartnerFormSchema,
    ) as Resolver<DeliveryPartnerFormValues>,
    defaultValues: DEFAULT_VALUES,
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
    setSubmitError(null);
    setStep(STEP_ORDER[stepIndex - 1]);
  }

  async function onSubmit(values: DeliveryPartnerFormValues) {
    setSubmitError(null);
    setIsSubmitting(true);

    let result: DeliveryPartnerCreatedResult;

    try {
      // The name the bank gave is what the create body carries, so it is
      // merged in here rather than mirrored into the form as it resolves.
      result = await onCreated({
        ...values,
        accountHolderName: validation.accountName ?? values.accountHolderName,
      });
    } catch (error) {
      setSubmitError(toErrorMessage(error));
      return;
    } finally {
      setIsSubmitting(false);
    }

    // The API decides which of these is true, so neither dialog claims
    // something it was not told. A partner created with no emailed credentials
    // and no returned password has neither to show — the manual dialog says so
    // rather than displaying a password nobody issued.
    const { response, failedDocuments } = result;

    setDocumentWarning(
      failedDocuments?.length
        ? `The partner was created, but ${failedDocuments.length === 1 ? "this document" : "these documents"} could not be uploaded: ${failedDocuments.join(", ")}. Add them from the partner's profile.`
        : undefined,
    );

    if (response.credentialsEmailed) {
      setSuccessStage("auto");
      return;
    }

    setCredentials({
      email: response.profile?.email ?? values.email,
      password: response.generatedPassword ?? "",
    });
    setSuccessStage("manual");
  }

  return (
    <>
      <Dialog
        open={open && successStage === "none"}
        onOpenChange={onOpenChange}
      >
        {/* 580px wide, per the Create New Delivery Partner frame. The `sm:`
            prefix is what beats DialogContent's own `sm:max-w-sm` default. */}
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
              Create New Delivery Partner
            </DialogTitle>
            <DialogClose className="text-muted-foreground hover:text-foreground" />
          </div>

          {/* Radix warns when a dialog has no description; the steps are on
              screen, so this is for screen readers only. */}
          <DialogDescription className="sr-only">
            Create a delivery partner in three steps: contact details,
            documents, then location.
          </DialogDescription>

          <div className="space-y-6 px-6 py-5">
            <FormStepper STEPS={DELIVERYSTEPS} current={step} />

            <div className="max-h-[55vh] overflow-y-auto pr-1">
              {step === "contact" && (
                <ContactDetailsStep control={control} errors={errors} />
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
                variant="secondary"
                className="flex-1 rounded-full"
                onClick={() =>
                  stepIndex === 0 ? onOpenChange(false) : goBack()
                }
                disabled={isSubmitting}
              >
                {stepIndex === 0 ? "Cancel" : "Back"}
              </Button>
              <Button
                className="flex-1 rounded-full bg-primary text-white"
                onClick={goNext}
                isLoading={isSubmitting}
              >
                {isLastStep ? "Create User" : "Continue"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <RiderCreatedAutoVerifyDialog
        open={successStage === "auto"}
        onOpenChange={(next) => {
          if (!next) {
            setSuccessStage("none");
            onOpenChange(false);
          }
        }}
        warning={documentWarning}
      />

      {credentials && (
        <RiderCreatedManualVerifyDialog
          open={successStage === "manual"}
          onOpenChange={(next) => {
            if (!next) {
              setSuccessStage("none");
              onOpenChange(false);
            }
          }}
          credentials={credentials}
          warning={documentWarning}
        />
      )}
    </>
  );
}
