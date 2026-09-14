export type AccountType = "Charity Partner" | "Delivery";

export type ApplicantStatus = "Pending Review" | "Approved" | "Rejected";

/**
 * Which queue an applicant came from. The two review endpoints take different
 * ids and different paths, so a row has to remember where it belongs.
 *
 * `"unknown"` exists because the joined queue endpoint types `applicantType` as
 * free text: a value neither vocabulary recognises leaves the row visible but
 * unreviewable, which beats guessing an endpoint and sending a decision about
 * one record to another.
 */
export type ApplicantKind = "organization" | "rider" | "unknown";

/** One label/value fact in a detail card. */
export interface ApplicantFact {
  label: string;
  value: string;
}

export interface ApplicantDocument {
  label: string;
  /** Absent when the API only reports that a document was supplied. */
  url?: string;
  contentType?: string;
  /** False when the applicant has not uploaded this document yet. */
  provided: boolean;
}

export interface Applicant {
  /** The id the review endpoint expects — organizationId or riderProfileId. */
  id: string;
  /** The API's human-facing application reference, when it supplies one. */
  referenceNumber?: string;
  kind: ApplicantKind;
  name: string;
  /** The account's raw id — what the user endpoints expect. */
  userId: string;
  /** The short, human-facing account code, e.g. `USR-4521`. Absent for organizations. */
  userCode?: string;
  accountType: AccountType;
  date: string;
  email: string;
  status: ApplicantStatus | string;
  reviewer: string;
  reviewDate: string;
  phone: string;
  address: string;
  /** Set for riders, whose identity fields come from the joined user record. */
  country?: string;
  /** The document type the rider verified with, e.g. "Driver's Licence". */
  documentType?: string;
  /** The number on that document — its meaning follows `documentType`. */
  idNumber?: string;
  /** Unique Taxpayer Reference. UK riders only. */
  utr?: string;
  bank?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  /** Organization registration facts. */
  details?: ApplicantFact[];
  /**
   * Where the rider will deliver, and what they charge for each.
   *
   * Always empty: the admin API exposes no rider service areas or pricing. The
   * field exists so the view can say the data is unavailable rather than
   * quietly dropping a section the spec asks for.
   */
  locations?: ApplicantFact[];
  documents: ApplicantDocument[];
  rejectionReason?: string;
  avatarUrl?: string;
}
