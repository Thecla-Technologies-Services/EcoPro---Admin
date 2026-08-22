import { type Applicant } from "@/types/verification";

/**
 * Drives the verification queue from `DUMMY_APPLICATIONS` instead of the API.
 *
 * The pending endpoints return nothing usable yet, so the page would otherwise
 * render an empty state and none of the layout could be reviewed. Flip this to
 * `false` to go back to the live queues — the query wiring in the page is intact
 * and gated on this one constant, so nothing else has to change.
 */
export const USE_DUMMY_DATA = true;

const CONTACT = {
  email: "contact@greenearth.ng",
  phone: "+234 803 123 4567",
  address: "15 Sustainability Road, Lekki Phase 1, Lagos",
};

const BANK = {
  accountName: "Serah Okonkwo",
  accountNumber: "21674524512",
  bankName: "Access Bank PLC",
};

/** Both previews point at repo assets — no document endpoint exists to hit. */
const DOCUMENTS: Applicant["documents"] = [
  {
    label: "CAC Certificate",
    url: "/assets/images/placeholder1.jpg",
    contentType: "image/jpeg",
    provided: true,
  },
  {
    label: "ID Document",
    url: "/assets/images/placeholder2.jpg",
    contentType: "image/jpeg",
    provided: true,
  },
];

/** Names vary so that changing the selection is visible in the queue. */
const NAMES = [
  "Sarah Okonkwo",
  "Adebayo Ogunlesi",
  "Chiamaka Nwosu",
  "Tunde Bakare",
  "Fatima Bello",
  "Emeka Okafor",
  "Zainab Yusuf",
  "Oluwaseun Adeyemi",
  "Ngozi Eze",
  "Ibrahim Musa",
  "Amara Chukwu",
  "Kelechi Obi",
];

/**
 * Twelve pending applications, alternating between the two account types so both
 * badge styles and both document layouts are on screen.
 */
export const DUMMY_APPLICATIONS: Applicant[] = NAMES.map((name, index) => {
  const isOrganization = index % 2 === 0;

  return {
    id: `dummy-${index + 1}`,
    kind: isOrganization ? "organization" : "rider",
    name,
    userId: `dummy-user-${index + 1}`,
    userCode: `USR-${4521 + index}`,
    accountType: isOrganization ? "NGO" : "Delivery",
    date: "25 Mar 2026",
    email: CONTACT.email,
    phone: CONTACT.phone,
    address: CONTACT.address,
    status: "Pending Review",
    reviewer: "—",
    reviewDate: "—",
    // Given to both types so the card shows real values rather than dashes.
    // Live rider rows fetch theirs from the user detail endpoint instead.
    bank: BANK,
    details: isOrganization
      ? [
          { label: "Organization Type", value: "Non Profit" },
          { label: "Registration Number", value: "RC-1094832" },
          { label: "Contact Person", value: name },
        ]
      : [
          { label: "Verification Method", value: "Driver's Licence" },
          { label: "ID Number", value: "DL-8842019" },
          { label: "Stage", value: "Document Review" },
        ],
    documents: DOCUMENTS,
  };
});
