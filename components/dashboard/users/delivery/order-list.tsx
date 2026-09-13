"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { FilterPills, ListingTypeBadge } from "../pills";
import { DataState } from "@/components/shared/data-state";
import { Pagination } from "@/components/shared/pagination";
import { useDeliveryPartnerOrders } from "@/hooks/admin/use-delivery-partners";
import { toDeliveryPartnerOrder } from "@/lib/adapters/delivery-partner";
import {
  ALL_DELIVERY_STATUSES,
  DELIVERY_STATUS_OPTIONS,
  toDeliveryStatusParam,
  type DeliveryStatusFilter,
} from "@/constants/delivery-status";
import { Amount } from "@/components/shared/amount";

const PAGE_SIZE = 10;

/**
 * A delivery partner's orders, from `GET /delivery-partners/get-orders/{userId}`.
 *
 * The endpoint filters and pages itself, so the status pills and the page
 * position are parameters rather than work done over rows already in hand.
 * Changing the filter returns to the first page — otherwise page 3 of Pending
 * shows nothing when there are only two pages of it.
 */
export function OrderList({ userId }: { userId: string }) {
  const [filter, setFilter] = useState<DeliveryStatusFilter>(
    ALL_DELIVERY_STATUSES,
  );
  const [pageNumber, setPageNumber] = useState(1);
  // Anchors paging to the sheet body this list scrolls in.
  const listRef = useRef<HTMLDivElement>(null);

  const query = useDeliveryPartnerOrders(
    userId,
    toDeliveryStatusParam(filter),
    {
      pageNumber,
      pageSize: PAGE_SIZE,
    },
  );

  const orders = (query.data?.data ?? []).map(toDeliveryPartnerOrder);

  return (
    <div ref={listRef} className="space-y-4">
      <FilterPills
        options={DELIVERY_STATUS_OPTIONS}
        active={filter}
        onChange={(next) => {
          setFilter(next);
          setPageNumber(1);
        }}
      />

      <DataState>
        <DataState.Error
          when={query.isError}
          error={query.error}
          onRetry={() => query.refetch()}
        />
        <DataState.Loading
          when={query.isPending}
          rows={3}
          rowClassName="h-28"
        />
        <DataState.Empty when={orders.length === 0}>
          <div className="flex flex-col gap-4 items-center justify-center py-16">
            <Image
              src="/assets/images/all-listing-empty.png"
              alt="No orders"
              width={90}
              height={90}
            />
            <p className="text-sm md:text-base font-medium text-foreground">
              No Listed Items for now
            </p>
          </div>
        </DataState.Empty>
        <DataState.Content
          busy={query.isFetching}
          className="mt-4 space-y-3 max-h-80 overflow-y-auto pr-1"
        >
          {orders.map((order) => (
            <div key={order.id} className="rounded-xl bg-neutral-50 p-3">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-2">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {order.itemName}
                    </p>
                    {order.orderNumber !== undefined && (
                      <p className="text-xs text-[#868686]">
                        Order #{order.orderNumber}
                      </p>
                    )}
                    <ListingTypeBadge type={order.status} />
                  </div>
                  <div className="text-right">
                    <p className="whitespace-nowrap text-sm font-semibold text-emerald-600">
                      <Amount amount={order.price} currency={order.currency} />
                    </p>
                    <p className="mt-1 text-xs text-[#868686]">{order.date}</p>
                  </div>
                </div>
              </div>

              {order.reason && (
                <div className="mt-2 text-xs">
                  <span className="text-neutral-400">Reason</span>
                  <p className="text-neutral-700">{order.reason}</p>
                </div>
              )}

              <div className="mt-2 flex items-center justify-between text-xs text-neutral-500">
                <div className="space-y-2">
                  <p className="text-[#868686] font-medium text-xs">Pickup</p>
                  <p className="font-medium text-foreground text-sm">
                    {order.pickup}
                  </p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-foreground" />
                <div className="text-right space-y-2">
                  <p className="text-[#868686] font-medium text-xs">Drop-off</p>
                  <p className="font-medium text-foreground text-sm">
                    {order.dropoff}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </DataState.Content>
      </DataState>

      {(query.data?.totalPages ?? 1) > 1 && (
        <Pagination
          current={pageNumber}
          total={query.data?.totalPages ?? 1}
          onChange={setPageNumber}
          totalCount={query.data?.totalRecords}
          scrollAnchorRef={listRef}
        />
      )}
    </div>
  );
}
