"use client";

import { useMemo } from "react";
import { useUserDirectory } from "@/hooks/admin/use-user-directory";
import { useDisputedSwaps } from "@/hooks/admin/use-swaps";
import {
  useListPanel,
  type ListPanelState,
} from "@/hooks/shared/use-list-panel";
import { toSwapOrder } from "@/lib/adapters/swap-order";
import type { Order } from "@/types/order";

/**
 * The Swaps & Orders list, standing on `GET /api/admin/swaps/disputed` until an
 * endpoint that lists every swap exists.
 *
 * That endpoint returns only disputed swap proposals, so this is a slice of the
 * page's subject rather than the whole of it — see `toSwapOrder` for what a
 * proposal cannot answer. It is used anyway because it is the only live source
 * there is, and real rows beat a fixture that can never be acted on.
 *
 * The parties come back as user ids, so the directory is joined in for their
 * names. Losing it costs names, not rows.
 */
export function useSwapOrdersPanel({
  pageSize,
}: { pageSize?: number } = {}): ListPanelState<Order> {
  const users = useUserDirectory();

  const usersById = useMemo(
    () => new Map((users.data ?? []).map((user) => [user.id ?? "", user])),
    [users.data],
  );

  return useListPanel({
    pageSize,
    useQuery: ({ pagination, search }) => {
      const query = useDisputedSwaps({
        // The API pages from 1; the table indexes from 0.
        pageNumber: pagination.pageIndex + 1,
        pageSize: pagination.pageSize,
        searchTerm: search || undefined,
      });

      return {
        rows: query.data?.data ?? [],
        totalPages: query.data?.totalPages,
        totalCount: query.data?.totalRecords,
        isPending: query.isPending,
        isFetching: query.isFetching,
        isError: query.isError,
        error: query.error,
        refetch: () => void query.refetch(),
      };
    },
    toRow: (dto) => toSwapOrder(dto, usersById),
  });
}
