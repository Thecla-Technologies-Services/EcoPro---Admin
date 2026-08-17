import type { User, UserRole, UserStatus } from "@/types/user";
import type { AdminUserDetailsDto, AdminUserSummaryDto } from "@/types/api/admin";

/**
 * The dashboard's role labels and the API's role names are different
 * vocabularies. This maps the `UserType` values the API is documented to return
 * onto the three labels the UI filters and badges by.
 *
 * ASSUMPTION: the swagger types `role` as a free-text string, so an unmapped
 * value is passed through rather than being forced into one of these buckets.
 */
const ROLE_LABELS: Record<string, UserRole> = {
  ecowarrior: "Individual",
  individual: "Individual",
  charitypartner: "NGO",
  ngo: "NGO",
  logisticspartner: "Delivery",
  independentrider: "Delivery",
  delivery: "Delivery",
};

export function toRoleLabel(role: string | null | undefined): UserRole | string {
  if (!role) return "Individual";
  return ROLE_LABELS[role.replace(/[\s_-]/g, "").toLowerCase()] ?? role;
}

/**
 * The row action menu keys off Active/Suspended, so `isActive` is the source of
 * truth when present and the API's own status text is the fallback.
 */
function toStatus(
  status: string | null | undefined,
  isActive: boolean | undefined
): UserStatus | string {
  if (isActive === false) return "Suspended";
  if (isActive === true) return "Active";
  return status ?? "Active";
}

/** Maps a row from `GET /api/admin/users` onto the shape the table renders. */
export function toUserRow(dto: AdminUserSummaryDto): User {
  return {
    id: dto.id ?? "",
    sn: dto.sn,
    name: dto.name ?? "Unnamed user",
    avatar: dto.profilePictureUrl ?? undefined,
    role: toRoleLabel(dto.role),
    code: dto.userCode ?? "—",
    email: dto.email ?? "",
    balance: dto.balance ?? 0,
    ecoPoints: dto.ecoPoints ?? 0,
    status: toStatus(dto.status, dto.isActive),
    // The list endpoint carries no listings indicator and no trend direction,
    // so both are left unset and the table renders a placeholder.
  };
}

/**
 * Merges `GET /api/admin/users/{userId}` over the row already in hand, so the
 * profile sheet can render immediately and fill in as the detail arrives.
 */
export function toUserDetails(dto: AdminUserDetailsDto, row?: User): User {
  const name =
    dto.name ??
    [dto.firstName, dto.lastName].filter(Boolean).join(" ") ??
    row?.name ??
    "Unnamed user";

  return {
    ...row,
    id: dto.userId ?? row?.id ?? "",
    sn: row?.sn,
    name,
    avatar: dto.profilePictureUrl ?? row?.avatar,
    role: toRoleLabel(dto.accountRole ?? (row?.role as string)),
    code: dto.userCode ?? row?.code ?? "—",
    email: dto.email ?? row?.email ?? "",
    phone: dto.phoneNumber ?? row?.phone,
    balance: dto.walletFunds ?? row?.balance ?? 0,
    ecoPoints: dto.ecoPoints ?? row?.ecoPoints ?? 0,
    status: toStatus(dto.accountStatus, dto.isActive),
    totalListings: dto.totalListings,
    totalSold: dto.totalSold,
    totalPurchased: dto.totalPurchased,
    signupDate: dto.signupDate,
    lastActive: dto.lastActive ?? undefined,
    emailVerified: dto.emailVerified,
    kycStatus: dto.kycStatus ?? undefined,
    accountHolderName: dto.bankDetails?.accountHolderName ?? undefined,
    accountNumber: dto.bankDetails?.accountNumber ?? undefined,
    bankName: dto.bankDetails?.bankName ?? undefined,
    sortCode: dto.bankDetails?.sortCode ?? undefined,
    iban: dto.bankDetails?.iban ?? undefined,
    swiftCode: dto.bankDetails?.swiftBicCode ?? undefined,
  };
}

/** The tab labels shown above the users table. */
export const USER_FILTER_TABS = [
  "All Users",
  "Individual",
  "NGO",
  "Delivery",
  "Suspended",
] as const;

export type UserFilterTab = (typeof USER_FILTER_TABS)[number];

/**
 * Values sent as the `Tab` query parameter.
 *
 * ASSUMPTION: the swagger declares `Tab` as an unconstrained string with no
 * enum, so these slugs are inferred from the metrics the same endpoint returns
 * (individual / ngoPartners / deliveryPartners / suspendedCount). If the API
 * expects different spellings, this map is the only thing that needs changing.
 */
export const USER_TAB_PARAMS: Record<UserFilterTab, string | undefined> = {
  "All Users": undefined,
  Individual: "individual",
  NGO: "ngo",
  Delivery: "delivery",
  Suspended: "suspended",
};
