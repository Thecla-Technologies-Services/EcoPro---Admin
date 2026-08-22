"use client";

import { useState } from "react";
import { ChevronLeft, X } from "lucide-react";
import { useForm,  type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormStepper } from "../stepper";
import { ContactDetailsStep } from "./steps/contact-details-step";
import { DocumentsStep } from "./steps/document-step";
import { LocationStep } from "./steps/location-step";
import { ChangesSavedDialog } from "./rider-created-dialogs";
import { deliveryPartnerFormSchema } from "@/lib/validations/user";
import type {
  AccountValidationStatus,
  DeliveryPartner,
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
  onSaved: (values: DeliveryPartnerFormValues) => void;
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
  const [validationStatus, setValidationStatus] =
    useState<AccountValidationStatus>(
      partner.bank.accountHolderName ? "success" : "idle",
    );
  const [showSaved, setShowSaved] = useState(false);

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
    onSaved(values);
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

          <FormStepper STEPS={[{ label: "Contact Details", key: "contact" }, { label: "Documents", key: "documents" }, { label: "Location", key: "location" }]} current={step} />

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
              {step === "location" ? "Save Changes" : "Continue"}
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
