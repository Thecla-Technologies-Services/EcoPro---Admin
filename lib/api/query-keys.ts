import type { AdminQueryFilters } from "@/lib/api/params";

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
     * Staff accounts. Read from the identity service rather than the admin one,
     * but namespaced under users on purpose: suspending or deleting an account
     * already invalidates `users.all`, and this list has to follow.
     */
    admins: () => ["admin", "users", "admins"] as const,
    /**
     * The same identity-service list as `admins()`, unnarrowed — the only place
     * a rider's name, country and contact details can be read from.
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
    list: (tab?: string, filters?: AdminQueryFilters) =>
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
    pendingOrganizations: () =>
      ["admin", "verification", "organizations", "pending"] as const,
    pendingRiders: () => ["admin", "verification", "riders", "pending"] as const,
  },
} as const;
