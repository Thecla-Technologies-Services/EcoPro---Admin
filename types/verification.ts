export type AccountType = "NGO" | "Delivery";

export type ApplicantStatus = "Pending Review" | "Approved" | "Rejected";

/**
 * Which queue an applicant came from. The two review endpoints take different
 * ids and different paths, so a row has to remember where it belongs.
 */
export type ApplicantKind = "organization" | "rider";

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
  kind: ApplicantKind;
  name: string;
  userId: string;
  accountType: AccountType;
  date: string;
  email: string;
  status: ApplicantStatus | string;
  reviewer: string;
  reviewDate: string;
  phone: string;
  address: string;
  bank?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
  };
  /** Extra key/value facts to show in place of bank details, e.g. rider checks. */
  details?: { label: string; value: string }[];
  documents: ApplicantDocument[];
  rejectionReason?: string;
  avatarUrl?: string;
}
