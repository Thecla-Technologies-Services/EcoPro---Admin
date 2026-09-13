"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import {
  buildFormData,
  buildQueryString,
  paginationParams,
  type AdminQueryFilters,
} from "@/lib/api/params";
import { adminKeys } from "@/lib/api/query-keys";
import type {
  AdminUserListingItemDtoPaginatedResponseDto,
  OrganizationDto,
} from "@/types/api/admin";

/**
 * The fields `POST /verification/organizations/create` accepts.
 *
 * Declared here rather than in the generated DTOs because the swagger models
 * both organization write endpoints as inline multipart bodies — they have no
 * named schema to generate from. The six the API requires are required here so
 * a missing one is a type error rather than a 400.
 */
export interface CreateOrganizationInput {
  organizationName: string;
  registrationNumber: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  organizationAddress: string;
  postalCode?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  sortCode?: string;
  iban?: string;
  swiftCode?: string;
  profileImage?: File | null;
  documents?: File[];
}

/**
 * The fields `PUT /verification/organizations/{organizationId}` accepts.
 *
 * Two differences from create, both the API's: the address is optional, and
 * uploaded files are `NewDocuments` — they are added to the organization's
 * documents rather than replacing them, so removing one is not something this
 * endpoint can do.
 */
export interface UpdateOrganizationInput
  extends Omit<CreateOrganizationInput, "organizationAddress" | "documents"> {
  organizationId: string;
  organizationAddress?: string;
  newDocuments?: File[];
}

/** GET /api/admin/verification/organizations/{organizationId} */
export function useOrganization(organizationId: string | undefined) {
  return useQuery({
    queryKey: adminKeys.verification.organization(organizationId ?? ""),
    queryFn: () =>
      apiFetch<OrganizationDto>(
        `/verification/organizations/${organizationId}`
      ),
    enabled: Boolean(organizationId),
  });
}

/**
 * GET /api/admin/verification/organizations/{organizationId}/donations
 *
 * The organization's listings, which for a charity partner are its donations.
 */
export function useOrganizationDonations(
  organizationId: string | undefined,
  filters?: AdminQueryFilters
) {
  return useQuery({
    queryKey: adminKeys.verification.organizationDonations(
      organizationId ?? "",
      filters
    ),
    queryFn: () =>
      apiFetch<AdminUserListingItemDtoPaginatedResponseDto>(
        `/verification/organizations/${organizationId}/donations${buildQueryString(
          paginationParams(filters)
        )}`
      ),
    enabled: Boolean(organizationId),
    placeholderData: keepPreviousData,
  });
}

/**
 * POST /api/admin/verification/organizations/create
 *
 * Creates the organization and the account behind it, which is why this
 * invalidates the users list as well as the verification queue. The new
 * organization lands in that queue awaiting review — creating it is not
 * approving it.
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrganizationInput) =>
      apiFetch<OrganizationDto>("/verification/organizations/create", {
        method: "POST",
        body: buildFormData({
          OrganizationName: input.organizationName,
          RegistrationNumber: input.registrationNumber,
          ContactPersonName: input.contactPersonName,
          ContactEmail: input.contactEmail,
          ContactPhoneNumber: input.contactPhoneNumber,
          OrganizationAddress: input.organizationAddress,
          PostalCode: input.postalCode,
          BankName: input.bankName,
          AccountNumber: input.accountNumber,
          AccountName: input.accountName,
          SortCode: input.sortCode,
          Iban: input.iban,
          SwiftCode: input.swiftCode,
          ProfileImage: input.profileImage,
          Documents: input.documents,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.verification.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard.all });
    },
  });
}

/** PUT /api/admin/verification/organizations/{organizationId} */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ organizationId, ...input }: UpdateOrganizationInput) =>
      apiFetch<OrganizationDto>(
        `/verification/organizations/${organizationId}`,
        {
          method: "PUT",
          body: buildFormData({
            OrganizationName: input.organizationName,
            RegistrationNumber: input.registrationNumber,
            ContactPersonName: input.contactPersonName,
            ContactEmail: input.contactEmail,
            ContactPhoneNumber: input.contactPhoneNumber,
            OrganizationAddress: input.organizationAddress,
            PostalCode: input.postalCode,
            BankName: input.bankName,
            AccountNumber: input.accountNumber,
            AccountName: input.accountName,
            SortCode: input.sortCode,
            Iban: input.iban,
            SwiftCode: input.swiftCode,
            ProfileImage: input.profileImage,
            NewDocuments: input.newDocuments,
          }),
        }
      ),
    onSuccess: () => {
      // The response is the updated organization, but seeding the detail key
      // would be undone by this: `verification.all` is its prefix, so the
      // queue, the pending list and the detail all refetch together.
      queryClient.invalidateQueries({ queryKey: adminKeys.verification.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
  });
}
