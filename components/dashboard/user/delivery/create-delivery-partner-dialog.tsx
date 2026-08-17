"use client";

import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { useForm , type Resolver } from "react-hook-form";
import { zodResolver} from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DeliveryPartnerStepper } from "../stepper";
import { ContactDetailsStep } from "./steps/contact-details-step";
import { DocumentsStep } from "./steps/document-step";
import { LocationStep } from "./steps/location-step";
import {
  RiderCreatedAutoVerifyDialog,
  RiderCreatedManualVerifyDialog,
} from "./rider-created-dialogs";
import { deliveryPartnerFormSchema } from "@/lib/validations/user";
import { DELIVERYSTEPS, generateRiderPassword } from "@/constants/user";
import type {
  AccountValidationStatus,
  CreatedRiderCredentials,
  DeliveryPartnerFormValues,
  DeliveryPartnerStep,
} from "@/types/user";

const STEP_ORDER: DeliveryPartnerStep[] = ["contact", "documents", "location"];

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
    "bankAccountNumber",
  ],
  location: [
    "country",
    "state",
    "lga",
    "region",
    "city",
    "area",
    "verifyEmailAutomatically",
  ],
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

interface CreateDeliveryPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (values: DeliveryPartnerFormValues) => void;
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
  const [validationStatus, setValidationStatus] =
    useState<AccountValidationStatus>("idle");
  const [successStage, setSuccessStage] = useState<"none" | "auto" | "manual">(
    "none",
  );
  const [credentials, setCredentials] =
    useState<CreatedRiderCredentials | null>(null);

  const {
    control,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeliveryPartnerFormValues>({
    resolver: zodResolver(deliveryPartnerFormSchema) as Resolver<DeliveryPartnerFormValues>,
    defaultValues: DEFAULT_VALUES,
    mode: "onSubmit",
  });

  const documents = watch("documents");
  const existingDocuments = watch("existingDocuments");
  const bankAccountNumber = watch("bankAccountNumber");
  const country = watch("country");
  const state = watch("state");

  const stepIndex = STEP_ORDER.indexOf(step);

  async function goNext() {
    const valid = await trigger(STEP_FIELDS[step]);
    if (!valid) return;

    if (step === "location") {
      handleSubmit(onSubmit)();
      return;
    }
    setStep(STEP_ORDER[stepIndex + 1]);
  }

  function goBack() {
    if (stepIndex === 0) return;
    setStep(STEP_ORDER[stepIndex - 1]);
  }

  function onSubmit(values: DeliveryPartnerFormValues) {
    onCreated(values);
    if (values.verifyEmailAutomatically) {
      setSuccessStage("auto");
    } else {
      setCredentials({
        email: values.email,
        password: generateRiderPassword(),
      });
      setSuccessStage("manual");
    }
  }

  return (
    <>
      <Dialog
        open={open && successStage === "none"}
        onOpenChange={onOpenChange}
      >
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
              Create New Delivery Partner
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

          <DeliveryPartnerStepper
            STEPS={DELIVERYSTEPS}
            current={step}
          />

          <div className="max-h-[60vh] overflow-y-auto pr-1">
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
                bankAccountNumber={bankAccountNumber}
                validationStatus={validationStatus}
                onValidationStatusChange={(status, holderName) => {
                  setValidationStatus(status);
                  if (holderName) setValue("accountHolderName", holderName);
                }}
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

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => (stepIndex === 0 ? onOpenChange(false) : goBack())}
            >
              {stepIndex === 0 ? "Cancel" : "Back"}
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={goNext}
            >
              {step === "location" ? "Create User" : "Continue"}
            </Button>
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
        />
      )}
    </>
  );
}
