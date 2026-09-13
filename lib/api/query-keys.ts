import type {
  AdminQueryFilters,
  ListingQueryFilters,
} from "@/lib/api/params";

/**
 * Central registry of React Query cache keys.
 *
 * Keys are hierarchical so a mutation can invalidate a whole domain
 * (`adminKeys.users.all`) or one record (`adminKeys.users.detail(id)`) without
 * every call site re-inventing the shape.
 */
export const adminKeys = {
  all: ["admin"] as const,

  dashboard: {
    all: ["admin", "dashboard"] as const,
    overview: () => ["admin", "dashboard", "overview"] as const,
    financialOverview: (filter?: string) =>
      ["admin", "dashboard", "financial-overview", filter ?? null] as const,
    actionRequired: (filters?: AdminQueryFilters) =>
      ["admin", "dashboard", "action-required", filters ?? {}] as const,
  },

  users: {
    all: ["admin", "users"] as const,
    list: (tab?: string, filters?: AdminQueryFilters) =>
      ["admin", "users", "list", tab ?? null, filters ?? {}] as const,
    /**
     * The identity service's full user list — the only place a rider's name,
     * country and contact details can be read from. Namespaced under users on
     * purpose: suspending or deleting an account already invalidates
     * `users.all`, and this list has to follow.
     */
    directory: () => ["admin", "users", "directory"] as const,
    detail: (userId: string) => ["admin", "users", "detail", userId] as const,
    listings: (userId: string, listingType?: string, filters?: AdminQueryFilters) =>
      ["admin", "users", "detail", userId, "listings", listingType ?? null, filters ?? {}] as const,
    transactions: (
      userId: string,
      transactionType?: string,
      filters?: AdminQueryFilters
    ) =>
      ["admin", "users", "detail", userId, "transactions", transactionType ?? null, filters ?? {}] as const,
  },

  listings: {
    all: ["admin", "listings"] as const,
    list: (tab?: string, filters?: ListingQueryFilters) =>
      ["admin", "listings", "list", tab ?? null, filters ?? {}] as const,
    detail: (listingId: string) => ["admin", "listings", "detail", listingId] as const,
  },

  roles: {
    all: ["admin", "roles"] as const,
    list: (filters?: AdminQueryFilters) =>
      ["admin", "roles", "list", filters ?? {}] as const,
    detail: (roleId: string) => ["admin", "roles", "detail", roleId] as const,
    permissions: () => ["admin", "roles", "permissions"] as const,
  },

  swaps: {
    all: ["admin", "swaps"] as const,
    disputed: (filters?: AdminQueryFilters) =>
      ["admin", "swaps", "disputed", filters ?? {}] as const,
    settings: () => ["admin", "swap-settings"] as const,
  },

  reports: {
    all: ["admin", "reports"] as const,
    list: (status?: string, filters?: AdminQueryFilters) =>
      ["admin", "reports", "list", status ?? null, filters ?? {}] as const,
  },

  listingReports: {
    all: ["admin", "listing-reports"] as const,
    list: (status?: string, filters?: AdminQueryFilters) =>
      ["admin", "listing-reports", "list", status ?? null, filters ?? {}] as const,
  },

  editRequests: {
    all: ["admin", "edit-requests"] as const,
    list: (params?: object) => ["admin", "edit-requests", "list", params ?? {}] as const,
    detail: (id: string) => ["admin", "edit-requests", "detail", id] as const,
  },

  verification: {
    all: ["admin", "verification"] as const,
    methods: (country?: string) =>
      ["admin", "verification", "methods", country ?? null] as const,
    /**
     * The joined queue endpoint, which reports organizations and riders
     * together. Kept alongside the two pending lists rather than replacing
     * their keys: reviewing still goes through the per-kind endpoints, so a
     * decision has to invalidate both shapes.
     */
    queue: (tab?: string, filters?: AdminQueryFilters) =>
      ["admin", "verification", "queue", tab ?? null, filters ?? {}] as const,
    pendingOrganizations: () =>
      ["admin", "verification", "organizations", "pending"] as const,
    organization: (organizationId: string) =>
      ["admin", "verification", "organizations", "detail", organizationId] as const,
    organizationDonations: (organizationId: string, filters?: AdminQueryFilters) =>
      [
        "admin",
        "verification",
        "organizations",
        "detail",
        organizationId,
        "donations",
        filters ?? {},
      ] as const,
    pendingRiders: () => ["admin", "verification", "riders", "pending"] as const,
  },

  deliveryPartners: {
    all: ["admin", "delivery-partners"] as const,
    detail: (userId: string) =>
      ["admin", "delivery-partners", "detail", userId] as const,
    orders: (userId: string, status?: string, filters?: AdminQueryFilters) =>
      [
        "admin",
        "delivery-partners",
        "detail",
        userId,
        "orders",
        status ?? null,
        filters ?? {},
      ] as const,
    /**
     * The gateway's bank list for a country. Namespaced under delivery partners
     * because that is the only endpoint serving it, though the list itself is
     * about the country rather than any one partner.
     */
    banks: (country?: string) =>
      ["admin", "delivery-partners", "banks", country ?? null] as const,
    /**
     * The name a bank holds for an account number. A read modelled as a POST by
     * the API, cached as a query anyway: the same three inputs always resolve to
     * the same name, and a form that re-checks on every keystroke is what the
     * cache is for.
     */
    resolvedAccount: (country: string, bankCode: string, accountNumber: string) =>
      [
        "admin",
        "delivery-partners",
        "resolved-account",
        country,
        bankCode,
        accountNumber,
      ] as const,
  },

  payouts: {
    all: ["admin", "payout-settings"] as const,
    settings: () => ["admin", "payout-settings", "settings"] as const,
    pendingWithdrawals: () =>
      ["admin", "payout-settings", "withdrawals", "pending"] as const,
  },

  support: {
    all: ["admin", "support"] as const,
    tickets: (status?: string, filters?: AdminQueryFilters) =>
      ["admin", "support", "tickets", status ?? null, filters ?? {}] as const,
    featureSuggestions: (filters?: AdminQueryFilters) =>
      ["admin", "support", "feature-suggestions", filters ?? {}] as const,
    /**
     * FAQ articles are written, edited and deleted through the admin API but
     * never read back through it — there is no list endpoint — so this key
     * exists only as the thing the three mutations invalidate.
     */
    faq: () => ["admin", "support", "faq"] as const,
  },
} as const;
