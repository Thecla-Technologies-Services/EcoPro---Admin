import type {
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
 * Combines the dialog's picked reason with its free-text note into the single
 * `rejectionReason` string both review endpoints accept.
 */
export function toRejectionReason(reason: string, note: string): string {
  const trimmed = note.trim();
  return trimmed ? `${reason} — ${trimmed}` : reason;
}
