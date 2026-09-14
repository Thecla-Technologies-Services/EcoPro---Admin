import { DeliveryPartnerStep, CharityPartnerStep } from "@/types/user";
export const NIGERIAN_STATES_WITH_LGAS: Record<string, string[]> = {
  Lagos: [
    "Alimosho",
    "Ikeja",
    "Eti-Osa",
    "Surulere",
    "Kosofe",
    "Ikorodu",
    "Badagry",
  ],
  Abuja: ["Abaji", "Bwari", "Gwagwalada", "Kuje", "Municipal Area Council"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Eleme", "Ikwerre"],
  Kano: ["Kano Municipal", "Fagge", "Nassarawa", "Dala"],
};

/**
 * Location before Documents: the bank list on the Documents step is fetched per
 * country, so the country has to be chosen before that step is shown.
 */
export const DELIVERYSTEPS: { key: DeliveryPartnerStep; label: string }[] = [
  { key: "contact", label: "Contact Details" },
  { key: "location", label: "Location" },
  { key: "documents", label: "Documents" },
];

export const CHARITY_PARTNER_STEPS: { key: CharityPartnerStep; label: string }[] = [
  { key: "contact", label: "Contact Details" },
  { key: "documents", label: "Documents" },
];
