import type { User, UserRole, UserStatus } from "@/types/user";
import type {
  AdminUserDetailsDto,
  AdminUserSummaryDto,
  UserDto,
} from "@/types/api/admin";
import { humanise, toLabel } from "@/lib/adapters/shared";

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
  admin: "Admin",
};

export function toRoleLabel(role: string | null | undefined): UserRole | string {
  return toLabel(ROLE_LABELS, role, "Individual");
}

/**
 * An account's own standing — Active or Suspended — as opposed to the status of
 * anything it has applied for.
 *
 * The row action menu keys off Active/Suspended, so `isActive` is the source of
 * truth when present and the API's own status text is the fallback.
 */
export function toAccountStatus(
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
    status: toAccountStatus(dto.status, dto.isActive),
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
    status: toAccountStatus(dto.accountStatus, dto.isActive),
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
 * These are the endpoint's documented set — its swagger summary reads "tab
 * filters (All, Individual, NGO, Delivery, Suspended)" — spelled exactly as
 * documented, since `Tab` is typed as a bare string and an unrecognised value
 * would quietly return an unfiltered list instead of failing.
 *
 * Note what is missing: there is no tab for staff accounts. Selecting or
 * excluding them is the endpoint's separate `Role` / `ExcludeAdmins`
 * parameters, not a tab, so `All` here means every account kind including
 * admins.
 */
export const USER_TAB_PARAMS: Record<UserFilterTab, string | undefined> = {
  "All Users": "All",
  Individual: "Individual",
  NGO: "NGO",
  Delivery: "Delivery",
  Suspended: "Suspended",
};

/**
 * The admin's location as one line, from the identity service's user record.
 *
 * Composed here rather than in the view because the pieces are spread across
 * four optional fields and the API's country tokens are PascalCase
 * ("UnitedKingdom"). Returns undefined when none of them are set, so a caller
 * can show a placeholder instead of a string of stray commas.
 */
export function toLocation(dto: UserDto | undefined): string | undefined {
  const parts = [
    dto?.address,
    dto?.state,
    dto?.country ? humanise(dto.country) : undefined,
    dto?.postalCode,
  ]
    .map((part) => part?.trim())
    .filter(Boolean);

  return parts.length ? parts.join(", ") : undefined;
}
