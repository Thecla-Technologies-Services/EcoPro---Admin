import type {
  AdminUserDetailsDto,
  AdminVerificationItemDto,
  BankDetailsDto,
  OrganizationDto,
  RiderProfileDto,
  UserDto,
} from "@/types/api/admin";
import type {
  Applicant,
  ApplicantDocument,
  ApplicantStatus,
} from "@/types/verification";
import { PLACEHOLDER, formatDate, humanise, toLabel } from "@/lib/adapters/shared";

/** Rows with no submission date sort last rather than being dropped. */
function toTime(iso: string | null | undefined): number {
  const time = iso ? new Date(iso).getTime() : NaN;
  return Number.isNaN(time) ? -Infinity : time;
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
  return toLabel(STATUS_LABELS, status, "Pending Review");
}

/**
 * `verificationMethod` names the document a rider uploaded. Splitting the token
 * on case gives "Nin Slip" and "Drivers License", so the ones an admin reads on
 * every row are spelled out instead.
 */
const DOCUMENT_LABELS: Record<string, string> = {
  DriversLicense: "Driver's Licence",
  VotersCard: "Voter's Card",
  NinSlip: "NIN",
  Passport: "Passport",
  ShareCodeLink: "Share Code",
  Visa: "Visa",
  Pin: "PIN",
};

function toDocumentLabel(method: string | null | undefined): string {
  if (!method) return PLACEHOLDER;
  return DOCUMENT_LABELS[method] ?? humanise(method);
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

/**
 * Maps an organization onto a queue row.
 *
 * Serves both `GET /verification/organizations/pending` and the per-record
 * `GET /verification/organizations/{organizationId}`, which returns the same
 * shape with more of it filled in — the payout account, the profile image and
 * who reviewed it come back only from the second.
 */
export function toOrganizationApplicant(dto: OrganizationDto): Applicant {
  return {
    id: dto.id ?? "",
    referenceNumber: dto.referenceNumber ?? undefined,
    kind: "organization",
    name: dto.organizationName ?? dto.contactPersonName ?? "Unnamed organization",
    userId: dto.userId ?? PLACEHOLDER,
    accountType: "Charity Partner",
    date: formatDate(dto.submittedOn),
    email: dto.contactEmail ?? PLACEHOLDER,
    phone: dto.contactPhoneNumber ?? PLACEHOLDER,
    address:
      [dto.organizationAddress, dto.postalCode].filter(Boolean).join(", ") ||
      PLACEHOLDER,
    status: toStatus(dto.status),
    reviewer: dto.reviewedBy ?? PLACEHOLDER,
    reviewDate: formatDate(dto.reviewedOn),
    details: [
      {
        label: "Organization Type",
        value: dto.organizationType ? humanise(dto.organizationType) : PLACEHOLDER,
      },
      { label: "Registration Number", value: dto.registrationNumber ?? PLACEHOLDER },
      { label: "Contact Person", value: dto.contactPersonName ?? PLACEHOLDER },
    ],
    // The pending list omits the payout account; the detail endpoint carries it
    // as loose fields rather than the `BankDetailsDto` a user record uses.
    bank: toOrganizationBankAccount(dto),
    documents: toOrganizationDocuments(dto),
    rejectionReason: dto.rejectionReason ?? undefined,
    avatarUrl: dto.profileImageUrl ?? undefined,
  };
}

/**
 * An organization's payout account.
 *
 * `GET /verification/organizations/{organizationId}` carries it as loose
 * fields rather than the `BankDetailsDto` a user record uses, and the pending
 * list omits it entirely — so with none of them set the section is left out
 * rather than shown as three dashes.
 */
function toOrganizationBankAccount(
  dto: OrganizationDto
): Applicant["bank"] | undefined {
  const accountName = dto.accountName?.trim();
  const accountNumber = dto.accountNumber?.trim();
  const bankName = dto.bankName?.trim();

  if (!accountName && !accountNumber && !bankName) return undefined;

  return {
    accountName: accountName || PLACEHOLDER,
    accountNumber: accountNumber || PLACEHOLDER,
    bankName: bankName || PLACEHOLDER,
  };
}

/**
 * Which queue an applicant belongs to, from the joined queue's `applicantType`.
 *
 * Typed as free text in the swagger, so matched on a normalised token against
 * both vocabularies. An unrecognised value is not forced into either: sending a
 * decision to the wrong review endpoint would act on a different record.
 */
const ORGANIZATION_TYPES = new Set([
  "organization",
  "organisation",
  "charitypartner",
  "charity",
  "ngo",
]);

const RIDER_KINDS = new Set([
  "rider",
  "independentrider",
  "logisticspartner",
  "delivery",
  "deliverypartner",
]);

export function toApplicantKind(
  applicantType: string | null | undefined
): Applicant["kind"] {
  if (!applicantType) return "unknown";
  const token = applicantType.replace(/[\s_-]/g, "").toLowerCase();
  if (ORGANIZATION_TYPES.has(token)) return "organization";
  if (RIDER_KINDS.has(token)) return "rider";
  return "unknown";
}

/**
 * Maps a row from `GET /verification/queue` onto a queue row.
 *
 * This is a summary: the endpoint reports who applied, when, and what was
 * decided, but none of the evidence a decision rests on — no documents, no
 * payout account, no ID number. Those come from the per-kind endpoints once a
 * row is selected, which is why `documents` is empty here rather than absent.
 *
 * It is also the only list that reports `reviewedBy`, and the only one that
 * includes applications already decided — the two pending endpoints drop a row
 * the moment it is reviewed.
 */
export function toQueueApplicant(dto: AdminVerificationItemDto): Applicant {
  const kind = toApplicantKind(dto.applicantType);

  return {
    id: dto.id ?? "",
    referenceNumber: dto.referenceNumber ?? undefined,
    kind,
    name: dto.applicantName ?? "Unnamed applicant",
    // The queue keys rows by their application, not their account, so nothing
    // here can be handed to the user endpoints.
    userId: PLACEHOLDER,
    accountType: kind === "organization" ? "Charity Partner" : "Delivery",
    date: formatDate(dto.submissionDate),
    email: dto.contactEmail ?? PLACEHOLDER,
    phone: dto.contactPhoneNumber ?? PLACEHOLDER,
    address: PLACEHOLDER,
    status: toStatus(dto.status),
    reviewer: dto.reviewedBy ?? PLACEHOLDER,
    reviewDate: formatDate(dto.reviewDate),
    documents: [],
  };
}

/**
 * Fills a rider's queue row in from its verification profile and user record.
 *
 * The queue row supplies the identity, the profile the evidence. Neither is
 * complete on its own: `RiderProfileDto` carries no name or email, and the
 * queue carries no documents.
 */
export function withRiderDetail(
  base: Applicant,
  profile: RiderProfileDto | undefined,
  user: UserDto | undefined
): Applicant {
  if (!profile) return base;

  const detailed = toRiderApplicant(user ?? {}, profile);

  return {
    ...detailed,
    // The queue is the better source for these: it names the reviewer, and its
    // status covers decided applications the pending profile cannot describe.
    referenceNumber: base.referenceNumber ?? detailed.referenceNumber,
    name: user ? detailed.name : base.name,
    email: user ? detailed.email : base.email,
    phone: user ? detailed.phone : base.phone,
    status: base.status,
    reviewer: base.reviewer,
    reviewDate: base.reviewDate,
    date: base.date,
  };
}

/**
 * Maps an independent rider onto a queue row.
 *
 * The user record is the spine: `RiderProfileDto` carries no name, country,
 * email or phone, and the user list is the only place those exist. `profile` is
 * the rider's entry in the pending-verification queue, which is absent for any
 * rider who has not submitted — or whose submission was already reviewed, since
 * that queue only reports what is still awaiting a decision.
 */
function toRiderApplicant(user: UserDto, profile?: RiderProfileDto): Applicant {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  return {
    // The review endpoints take a riderProfileId, so a rider with nothing
    // pending has no reviewable id — the detail sheet hides its actions when
    // the status is not "Pending Review".
    id: profile?.id ?? "",
    kind: "rider",
    name: fullName || "Unnamed rider",
    userId: user.id ?? PLACEHOLDER,
    userCode: user.userCode ?? undefined,
    accountType: "Delivery",
    date: formatDate(profile?.submittedOn),
    email: user.email ?? PLACEHOLDER,
    phone: user.phoneNumber ?? PLACEHOLDER,
    address: user.address ?? PLACEHOLDER,
    country: user.country ? humanise(user.country) : PLACEHOLDER,
    documentType: profile ? toDocumentLabel(profile.verificationMethod) : PLACEHOLDER,
    idNumber: profile?.idNumber ?? PLACEHOLDER,
    // Only UK riders are asked for a UTR, so a blank one is expected rather
    // than missing data.
    utr: profile?.utr ?? PLACEHOLDER,
    // Nothing pending means nothing to report: the API exposes no verification
    // history, so an already-decided rider is indistinguishable from one who
    // never started. A placeholder says that rather than guessing.
    status: profile ? toStatus(profile.status) : PLACEHOLDER,
    reviewer: PLACEHOLDER,
    reviewDate: formatDate(profile?.reviewedOn),
    // The admin API exposes no rider service areas or pricing.
    locations: [],
    documents: profile ? toRiderDocuments(profile) : [],
    rejectionReason: profile?.rejectionReason ?? undefined,
    avatarUrl: user.profilePictureUrl ?? undefined,
  };
}

/**
 * `userType` is free text in the swagger, so match on a normalised token rather
 * than the exact enum spelling. `LogisticsPartner` is deliberately absent: it
 * shares the Delivery role label but is a company account, not an independent
 * rider.
 */
const RIDER_TYPES = new Set(["independentrider", "rider"]);

function isIndependentRider(userType: string | null | undefined): boolean {
  if (!userType) return false;
  return RIDER_TYPES.has(userType.replace(/[\s_-]/g, "").toLowerCase());
}

/**
 * Every independent rider on the platform, newest account first.
 *
 * `riderProfiles` is the pending-verification queue. It is optional because the
 * table can list every rider without it, but it is what carries the documents,
 * the UTR and the provider's result — so a rider with nothing pending shows an
 * onboarding record and no verification evidence.
 */
export function toRiderQueue(
  users: UserDto[] | null | undefined,
  riderProfiles?: RiderProfileDto[] | null
): Applicant[] {
  const profileByUser = new Map(
    (riderProfiles ?? []).map((profile) => [profile.userId, profile])
  );

  const riders = (users ?? []).filter((user) =>
    isIndependentRider(user.userType)
  );

  // Every row hangs off this one filter, so an empty result is worth naming —
  // the account-type vocabulary is the first thing to check when the page looks
  // like it has no riders.
  if (process.env.NODE_ENV !== "production" && users?.length && !riders.length) {
    const seen = [...new Set(users.map((user) => user.userType ?? "(none)"))];
    console.warn(
      `[riders] no user matched ${[...RIDER_TYPES].join(" / ")}. userType values in the directory: ${seen.join(", ")}`
    );
  }

  return riders
    .sort((a, b) => toTime(b.createdOn) - toTime(a.createdOn))
    .map((user) => toRiderApplicant(user, profileByUser.get(user.id)));
}

/**
 * The pending organization queue, newest submission first. Rows with no
 * submission date sort last rather than being dropped, so nothing awaiting
 * review can go unseen.
 */
export function toOrganizationQueue(
  organizations: OrganizationDto[] | null | undefined
): Applicant[] {
  return [...(organizations ?? [])]
    .sort((a, b) => toTime(b.submittedOn) - toTime(a.submittedOn))
    .map(toOrganizationApplicant);
}

/**
 * Everything awaiting a verification decision, newest submission first.
 *
 * The two pending endpoints are joined into one list because the queue reviews
 * partners, not record types. Organizations arrive complete; rider profiles
 * carry no name, email or phone, so each one is matched to its directory record
 * by `userId` — this is the join the rider table still does without.
 */
export function toVerificationQueue(
  organizations: OrganizationDto[] | null | undefined,
  riderProfiles: RiderProfileDto[] | null | undefined,
  users: UserDto[] | null | undefined
): Applicant[] {
  const byId = new Map((users ?? []).map((user) => [user.id, user]));

  const rows = [
    ...(organizations ?? []).map((dto) => ({
      at: toTime(dto.submittedOn),
      applicant: toOrganizationApplicant(dto),
    })),
    ...(riderProfiles ?? []).map((profile) => ({
      at: toTime(profile.submittedOn),
      // A pending profile whose user is missing from the directory is still
      // reviewable, so it maps against an empty record rather than vanishing
      // from the queue — the reviewer sees a nameless row, not one fewer.
      applicant: toRiderApplicant(byId.get(profile.userId ?? "") ?? {}, profile),
    })),
  ];

  return rows.sort((a, b) => b.at - a.at).map((row) => row.applicant);
}

/** A v4/v7 uuid, which is never a person's name. */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The account to look up to put a name to a decision, or undefined when
 * `reviewedBy` is already readable.
 *
 * The field is documented only as a string, and the API sends the reviewing
 * admin's id — but it is free to send a name or an email instead, so only a
 * value shaped like an id is treated as one.
 */
export function toReviewerId(
  reviewer: string | null | undefined
): string | undefined {
  const value = reviewer?.trim();
  return value && UUID.test(value) ? value : undefined;
}

/**
 * The name of whoever decided an application.
 *
 * `record` is that reviewer's account, fetched by `toReviewerId`. Until it
 * arrives the placeholder stands in — the id it replaces is not a name, and
 * showing it would be the thing this exists to avoid.
 */
export function toReviewerName(
  reviewer: string | null | undefined,
  record: AdminUserDetailsDto | undefined
): string {
  const value = reviewer?.trim();
  if (!value || value === PLACEHOLDER) return PLACEHOLDER;
  if (!UUID.test(value)) return value;

  return (
    record?.name ||
    [record?.firstName, record?.lastName].filter(Boolean).join(" ") ||
    record?.email ||
    PLACEHOLDER
  );
}

/**
 * Whether an application is still open to a decision.
 *
 * Only a pending one can be approved or rejected — a decided row is in the
 * queue to be read, not re-decided. An unrecognised status counts as decided:
 * `toStatus` passes an undocumented label straight through, and treating what
 * we cannot read as pending would offer buttons that act on a settled record.
 */
export function isAwaitingReview(applicant: Applicant | null): boolean {
  return applicant?.status === "Pending Review";
}

/**
 * A queue row's stable identity. Organization ids and rider-profile ids come
 * from different tables, so the kind has to be part of the key.
 */
export function applicantKey(applicant: Applicant): string {
  return `${applicant.kind}:${applicant.id}`;
}

/**
 * A rider's payout account.
 *
 * Bank details hang off `GET /api/admin/users/{userId}`, not the directory list
 * the rider rows are built from, so the detail panel fetches them separately
 * and maps them here. Every field is optional in the swagger; with none of them
 * set the applicant has no payout account and the section is left out rather
 * than shown as three dashes.
 */
export function toBankAccount(
  dto: BankDetailsDto | null | undefined
): Applicant["bank"] | undefined {
  const accountName = dto?.accountHolderName?.trim();
  const accountNumber = dto?.accountNumber?.trim();
  const bankName = dto?.bankName?.trim();

  if (!accountName && !accountNumber && !bankName) return undefined;

  return {
    accountName: accountName || PLACEHOLDER,
    accountNumber: accountNumber || PLACEHOLDER,
    bankName: bankName || PLACEHOLDER,
  };
}

/**
 * `rejectionReason`'s documented ceiling, on both review endpoints.
 */
export const REJECTION_REASON_MAX = 1000;

/** The separator between the picked reason and the free-text note. */
const REASON_SEPARATOR = " — ";

/**
 * Combines the dialog's picked reason with its free-text note into the single
 * `rejectionReason` string both review endpoints accept.
 *
 * The organization endpoint also takes the two apart — `rejectionCategory` and
 * `additionalNotes` — and is sent those as well; this string is what the rider
 * endpoint has room for, and what reads back as one sentence either way.
 */
export function toRejectionReason(reason: string, note: string): string {
  const trimmed = note.trim();
  return trimmed ? `${reason}${REASON_SEPARATOR}${trimmed}` : reason;
}

/**
 * How much note still fits once the picked reason and its separator are in.
 *
 * The combined string is what has to clear `REJECTION_REASON_MAX`, so the
 * budget is the note's alone — which is why the form caps on this rather than
 * on the limit itself. Never negative: a reason longer than the whole ceiling
 * would otherwise hand a negative `maxLength` to the textarea.
 */
export function rejectionNoteLimit(reason: string | null): number {
  const spent = reason ? reason.length + REASON_SEPARATOR.length : 0;
  return Math.max(0, REJECTION_REASON_MAX - spent);
}
