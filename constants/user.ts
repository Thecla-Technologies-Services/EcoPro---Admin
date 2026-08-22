import { DeliveryPartnerStep, NgoStep } from "@/types/user";
export const NIGERIAN_BANKS = [
  "Access Bank PLC",
  "Zenith Bank",
  "Guaranty Trust Bank",
  "First Bank of Nigeria",
  "United Bank for Africa",
  "Fidelity Bank",
  "Union Bank",
  "Stanbic IBTC Bank",
  "Wema Bank",
  "Sterling Bank",
] as const;

export const COUNTRIES = [
  "Nigeria",
  "United Kingdom",
  "United States",
  "Ghana",
  "Canada",
] as const;

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

export function generateRiderPassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export const DELIVERYSTEPS: { key: DeliveryPartnerStep; label: string }[] = [
  { key: "contact", label: "Contact Details" },
  { key: "documents", label: "Documents" },
  { key: "location", label: "Location" },
];

export const NGOSTEPS: { key: NgoStep; label: string }[] = [
  { key: "contact", label: "Contact Details" },
  { key: "documents", label: "Documents" },
];
