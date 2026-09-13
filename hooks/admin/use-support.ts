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
  CreateFaqArticleRequestDto,
  FaqArticleDto,
  FeatureSuggestionDtoPaginatedResponseDto,
  ResolveSupportTicketRequestDto,
  SupportTicketDto,
  SupportTicketDtoPaginatedResponseDto,
  SupportTicketStatus,
} from "@/types/api/admin";

/** GET /api/admin/support/tickets */
export function useSupportTickets(
  status?: SupportTicketStatus,
  filters?: AdminQueryFilters
) {
  return useQuery({
    queryKey: adminKeys.support.tickets(status, filters),
    queryFn: () =>
      apiFetch<SupportTicketDtoPaginatedResponseDto>(
        `/support/tickets${buildQueryString({
          status,
          ...paginationParams(filters),
        })}`
      ),
    // Keep the current page visible while the next one loads.
    placeholderData: keepPreviousData,
  });
}

/**
 * POST /api/admin/support/tickets/{ticketId}/resolve
 *
 * "Resolve" is the endpoint's name, but the body carries the status — so this
 * is also how a ticket is moved to In Progress.
 */
export function useResolveSupportTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      ...body
    }: ResolveSupportTicketRequestDto & { ticketId: string }) =>
      apiFetch<SupportTicketDto>(`/support/tickets/${ticketId}/resolve`, {
        method: "POST",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.support.all });
      queryClient.invalidateQueries({ queryKey: adminKeys.dashboard.all });
    },
  });
}

/** GET /api/admin/support/feature-suggestions */
export function useFeatureSuggestions(filters?: AdminQueryFilters) {
  return useQuery({
    queryKey: adminKeys.support.featureSuggestions(filters),
    queryFn: () =>
      apiFetch<FeatureSuggestionDtoPaginatedResponseDto>(
        `/support/feature-suggestions${buildQueryString(
          paginationParams(filters)
        )}`
      ),
    placeholderData: keepPreviousData,
  });
}

/**
 * POST /api/admin/support/faq
 *
 * The admin API writes FAQ articles but never reads them back — there is no
 * list or detail endpoint — so the three FAQ mutations have nothing to
 * invalidate but each other's key, and a page cannot show the articles it has
 * created. Reading them is the public site's job.
 */
export function useCreateFaqArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateFaqArticleRequestDto) =>
      apiFetch<FaqArticleDto>("/support/faq", { method: "POST", body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.support.faq() });
    },
  });
}

/**
 * PUT /api/admin/support/faq/{articleId}
 *
 * Takes the whole article, not a patch — the body is the same shape create
 * takes, so an omitted field is a cleared field.
 */
export function useUpdateFaqArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      articleId,
      ...body
    }: CreateFaqArticleRequestDto & { articleId: string }) =>
      apiFetch<FaqArticleDto>(`/support/faq/${articleId}`, {
        method: "PUT",
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.support.faq() });
    },
  });
}

/** DELETE /api/admin/support/faq/{articleId} */
export function useDeleteFaqArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (articleId: string) =>
      apiFetch<string>(`/support/faq/${articleId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.support.faq() });
    },
  });
}
