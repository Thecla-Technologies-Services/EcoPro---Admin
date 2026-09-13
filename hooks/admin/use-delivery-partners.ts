"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { apiFetch } from "@/lib/api/fetcher";
import {
  buildQueryString,
  paginationParams,
  type AdminQueryFilters,
} from "@/lib/api/params";
import { adminKeys } from "@/lib/api/query-keys";
import type {
  AdminDeliveryPartnerProfileDto,
  BankAccountResolutionResult,
  BankDto,
  Country,
  CreateDeliveryPartnerRequestDto,
  DeliveryPartnerCreatedResponseDto,
  DeliveryPartnerDocumentDto,
  DeliveryPartnerOrderDtoPaginatedResponseDto,
  OrganizationDocumentType,
  ResolveBankAccountRequestDto,
  UpdateDeliveryPartnerRequestDto,
} from "@/types/api/admin";

/**
 * `POST /api/admin/delivery-partners/upload-document/{userId}` takes a
 * multipart body, which the swagger declares inline rather than as a named
 * schema — so it is the one request shape on this endpoint family that the
 * generated DTOs do not cover.
 */
export interface UploadDeliveryPartnerDocumentInput {
  userId: string;
  documentType: OrganizationDocumentType;
  file: File;
}

/** GET /api/admin/delivery-partners/get/{userId} */
export function useDeliveryPartner(userId: string | undefined) {
  return useQuery({
    queryKey: adminKeys.deliveryPartners.detail(userId ?? ""),
    queryFn: () =>
      apiFetch<AdminDeliveryPartnerProfileDto>(
        `/delivery-partners/get/${userId}`
      ),
    enabled: Boolean(userId),
  });
}

/** GET /api/admin/delivery-partners/get-orders/{userId} */
export function useDeliveryPartnerOrders(
  userId: string | undefined,
  status?: string,
  filters?: AdminQueryFilters
) {
  return useQuery({
    queryKey: adminKeys.deliveryPartners.orders(userId ?? "", status, filters),
    queryFn: () =>
      apiFetch<DeliveryPartnerOrderDtoPaginatedResponseDto>(
        `/delivery-partners/get-orders/${userId}${buildQueryString({
          status,
          ...paginationParams(filters),
        })}`
      ),
    enabled: Boolean(userId),
    // Keep the current page visible while the next one loads.
    placeholderData: keepPreviousData,
  });
}

/**
 * GET /api/admin/delivery-partners/banks
 *
 * The gateway's bank list for a country, which is what turns the bank field
 * into a picker rather than free text — `bankCode` is what `resolve-account`
 * and the create/update bodies expect, and it is only obtainable from here.
 */
export function useBanks(country: Country | undefined) {
  return useQuery({
    queryKey: adminKeys.deliveryPartners.banks(country),
    queryFn: () =>
      apiFetch<BankDto[]>(
        `/delivery-partners/banks${buildQueryString({ country })}`
      ),
    enabled: Boolean(country),
    // The list changes when the gateway adds a bank, not between page views.
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * POST /api/admin/delivery-partners/resolve-account
 *
 * The name the bank holds for an account number. Modelled as a query despite
 * the POST: it changes nothing, and a form that re-checks as the admin types
 * wants the same three inputs to answer from cache the second time.
 *
 * A refusal — a wrong account number, a gateway that cannot reach the bank —
 * arrives as `success: false` with a message rather than as a failed request,
 * so the result has to be read, not just awaited.
 */
export function useResolvedBankAccount(input: Partial<ResolveBankAccountRequestDto>) {
  const { country, bankCode, accountNumber } = input;
  const complete = Boolean(country && bankCode && accountNumber);

  return useQuery({
    queryKey: adminKeys.deliveryPartners.resolvedAccount(
      country ?? "",
      bankCode ?? "",
      accountNumber ?? ""
    ),
    queryFn: () =>
      apiFetch<BankAccountResolutionResult>(
        "/delivery-partners/resolve-account",
        { method: "POST", body: { country, bankCode, accountNumber } }
      ),
    enabled: complete,
    // The bank's answer for an account number does not change while a form is
    // open, so never re-ask within a session.
    staleTime: Infinity,
    retry: false,
  });
}

/**
 * POST /api/admin/delivery-partners/create
 *
 * Returns the new profile alongside `generatedPassword` and
 * `credentialsEmailed` — when no password is sent the API makes one, and
 * whether it reached the partner by email is the API's to report. The caller
 * has to show the password when it was not emailed, so this is the one create
 * whose response cannot be discarded.
 */
export function useCreateDeliveryPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateDeliveryPartnerRequestDto) =>
      apiFetch<DeliveryPartnerCreatedResponseDto>("/delivery-partners/create", {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.deliveryPartners.all });
      // A delivery partner is an account, so the users list and its metrics
      // are stale too.
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
  });
}

/** PUT /api/admin/delivery-partners/update/{userId} */
export function useUpdateDeliveryPartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      ...body
    }: UpdateDeliveryPartnerRequestDto & { userId: string }) =>
      apiFetch<AdminDeliveryPartnerProfileDto>(
        `/delivery-partners/update/${userId}`,
        { method: "PUT", body }
      ),
    onSuccess: (data, { userId }) => {
      // The response is the updated profile, so seed it rather than making the
      // detail view refetch what we already have.
      queryClient.setQueryData(adminKeys.deliveryPartners.detail(userId), data);
      queryClient.invalidateQueries({ queryKey: adminKeys.users.all });
    },
  });
}

/** POST /api/admin/delivery-partners/upload-document/{userId} */
export function useUploadDeliveryPartnerDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      documentType,
      file,
    }: UploadDeliveryPartnerDocumentInput) => {
      const body = new FormData();
      // The field names are the API's, which capitalises them.
      body.append("DocumentType", documentType);
      body.append("File", file);

      return apiFetch<DeliveryPartnerDocumentDto>(
        `/delivery-partners/upload-document/${userId}`,
        { method: "POST", body }
      );
    },
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.deliveryPartners.detail(userId),
      });
    },
  });
}

/** DELETE /api/admin/delivery-partners/remove-document/{userId}/{documentId} */
export function useRemoveDeliveryPartnerDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      documentId,
    }: {
      userId: string;
      documentId: string;
    }) =>
      apiFetch<string>(
        `/delivery-partners/remove-document/${userId}/${documentId}`,
        { method: "DELETE" }
      ),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: adminKeys.deliveryPartners.detail(userId),
      });
    },
  });
}
