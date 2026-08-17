import type {
  OrganizationDto,
  RiderProfileDto,
} from "@/types/api/admin";
import type {
  Applicant,
  ApplicantDocument,
  ApplicantStatus,
} from "@/types/verification";

const PLACEHOLDER = "—";

function formatDate(iso: string | null | undefined): string {
  if (!iso) return PLACEHOLDER;

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return PLACEHOLDER;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * The API's status vocabulary is not documented as an enum, so anything outside
 * the three the queue knows about is passed through and the badge renders it
 * muted rather than silently mislabelling it as pending.
 */
const STATUS_LABELS: Record<string, ApplicantStatus> = {
  pending: "Pending Review",
  pendingreview: "Pending Review",
  pendingverification: "Pending Review",
  underreview: "Pending Review",
  submitted: "Pending Review",
  approved: "Approved",
  verified: "Approved",
  rejected: "Rejected",
  declined: "Rejected",
};

function toStatus(status: string | null | undefined): ApplicantStatus | string {
  if (!status) return "Pending Review";
  return STATUS_LABELS[status.replace(/[\s_-]/g, "").toLowerCase()] ?? status;
}

/** Splits a PascalCase API token ("DriversLicense") into words for display. */
function humanise(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function toOrganizationDocuments(
  dto: OrganizationDto
): ApplicantDocument[] {
  return (dto.documents ?? []).map((doc) => ({
    label: humanise(doc.documentType ?? doc.fileName ?? "Document"),
    url: doc.url ?? undefined,
    contentType: doc.contentType ?? undefined,
    provided: true,
  }));
}

/**
 * Riders come back as a checklist of booleans rather than files — the profile
 * DTO reports whether each image exists but carries no URL for it, so these
 * entries render as a status list with nothing to download.
 */
function toRiderDocuments(dto: RiderProfileDto): ApplicantDocument[] {
  const proofLabel = dto.proofOfAddressType
    ? `Proof of Address (${humanise(dto.proofOfAddressType)})`
    : "Proof of Address";

  return [
    { label: "ID — Front", provided: !!dto.hasIdFrontImage },
    { label: "ID — Back", provided: !!dto.hasIdBackImage },
    { label: "Selfie", provided: !!dto.hasSelfie },
    { label: proofLabel, provided: !!dto.hasProofOfAddress },
  ];
}

function percent(score: number | null | undefined): string | null {
  if (score === null || score === undefined) return null;
  // The confidence fields are documented as doubles with no stated range, so a
  // value at or below 1 is read as a fraction and anything above it as a
  // percentage already.
  const value = score <= 1 ? score * 100 : score;
  return `${Math.round(value)}%`;
}

/** The automated checks worth showing an admin before a manual override. */
function toRiderDetails(dto: RiderProfileDto): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [
    {
      label: "Verification Method",
      value: dto.verificationMethod ? humanise(dto.verificationMethod) : PLACEHOLDER,
    },
    { label: "ID Number", value: dto.idNumber ?? PLACEHOLDER },
    { label: "Stage", value: dto.stage ? humanise(dto.stage) : PLACEHOLDER },
    { label: "Next Step", value: dto.nextStep ? humanise(dto.nextStep) : PLACEHOLDER },
  ];

  if (dto.livenessPassed !== null && dto.livenessPassed !== undefined) {
    rows.push({
      label: "Liveness Check",
      value: dto.livenessPassed ? "Passed" : "Failed",
    });
  }

  const checks: [string, string | null][] = [
    ["Face Match", percent(dto.faceMatchScore)],
    ["Liveness Confidence", percent(dto.livenessConfidence)],
    ["Document Confidence", percent(dto.documentConfidence)],
  ];

  for (const [label, value] of checks) {
    if (value) rows.push({ label, value });
  }

  if (dto.documentExpiry) {
    rows.push({ label: "Document Expiry", value: formatDate(dto.documentExpiry) });
  }
  if (dto.utr) {
    rows.push({ label: "UTR", value: dto.utr });
  }

  return rows;
}

/** Maps a row from `GET /verification/organizations/pending` onto a queue row. */
function toOrganizationApplicant(dto: OrganizationDto): Applicant {
  return {
    id: dto.id ?? "",
    kind: "organization",
    name: dto.organizationName ?? dto.contactPersonName ?? "Unnamed organization",
    userId: dto.userId ?? PLACEHOLDER,
    accountType: "NGO",
    date: formatDate(dto.submittedOn),
    email: dto.contactEmail ?? PLACEHOLDER,
    phone: dto.contactPhoneNumber ?? PLACEHOLDER,
    address:
      [dto.organizationAddress, dto.postalCode].filter(Boolean).join(", ") ||
      PLACEHOLDER,
    status: toStatus(dto.status),
    // The API records when a decision was made but not who made it.
    reviewer: PLACEHOLDER,
    reviewDate: formatDate(dto.reviewedOn),
    details: [
      {
        label: "Organization Type",
        value: dto.organizationType ? humanise(dto.organizationType) : PLACEHOLDER,
      },
      { label: "Registration Number", value: dto.registrationNumber ?? PLACEHOLDER },
      { label: "Contact Person", value: dto.contactPersonName ?? PLACEHOLDER },
    ],
    documents: toOrganizationDocuments(dto),
    rejectionReason: dto.rejectionReason ?? undefined,
  };
}

/** Maps a row from `GET /verification/riders/pending` onto a queue row. */
function toRiderApplicant(dto: RiderProfileDto): Applicant {
  // RiderProfileDto carries no name, email or address — those live on the user
  // record, which this endpoint does not join. The reference is the only
  // human-readable handle available, so it stands in as the row's title.
  const reference = dto.verificationReference ?? dto.id?.slice(0, 8);

  return {
    id: dto.id ?? "",
    kind: "rider",
    name: reference ? `Rider ${reference}` : "Rider",
    userId: dto.userId ?? PLACEHOLDER,
    accountType: "Delivery",
    date: formatDate(dto.submittedOn),
    email: PLACEHOLDER,
    phone: PLACEHOLDER,
    address: PLACEHOLDER,
    status: toStatus(dto.status),
    reviewer: PLACEHOLDER,
    reviewDate: formatDate(dto.reviewedOn),
    details: toRiderDetails(dto),
    documents: toRiderDocuments(dto),
    rejectionReason: dto.rejectionReason ?? undefined,
  };
}

/**
 * Merges the two pending queues into the single list the table renders, newest
 * submission first. Rows with no submission date sort last rather than being
 * dropped, so nothing awaiting review can go unseen.
 */
export function toVerificationQueue(
  organizations: OrganizationDto[] | null | undefined,
  riders: RiderProfileDto[] | null | undefined
): Applicant[] {
  const toTime = (iso: string | null | undefined) => {
    const time = iso ? new Date(iso).getTime() : NaN;
    return Number.isNaN(time) ? -Infinity : time;
  };

  return [
    ...(organizations ?? []).map((dto) => ({
      applicant: toOrganizationApplicant(dto),
      submittedAt: toTime(dto.submittedOn),
    })),
    ...(riders ?? []).map((dto) => ({
      applicant: toRiderApplicant(dto),
      submittedAt: toTime(dto.submittedOn),
    })),
  ]
    .sort((a, b) => b.submittedAt - a.submittedAt)
    .map((row) => row.applicant);
}

/**
 * Combines the dialog's picked reason with its free-text note into the single
 * `rejectionReason` string both review endpoints accept.
 */
export function toRejectionReason(reason: string, note: string): string {
  const trimmed = note.trim();
  return trimmed ? `${reason} — ${trimmed}` : reason;
}
