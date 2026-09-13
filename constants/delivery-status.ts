import type { DeliveryStatus } from "@/types/api/admin";

/** Sentinel for "don't filter", since a pill cannot hold "". */
export const ALL_DELIVERY_STATUSES = "All";

export type DeliveryStatusFilter =
  | DeliveryStatus
  | typeof ALL_DELIVERY_STATUSES;

/**
 * The delivery states `GET /delivery-partners/get-orders/{userId}` filters by,
 * paired with readable labels.
 *
 * Values are the API's own `DeliveryStatus` enum members, so `InTransit` is sent
 * unspaced however it is displayed.
 */
export const DELIVERY_STATUS_OPTIONS: {
  value: DeliveryStatusFilter;
  label: string;
}[] = [
  { value: ALL_DELIVERY_STATUSES, label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "InTransit", label: "In Transit" },
  { value: "Delivered", label: "Delivered" },
  { value: "NotDelivered", label: "Not Delivered" },
];

/** Drops the sentinel, so an unfiltered view sends no `status` at all. */
export function toDeliveryStatusParam(
  filter: DeliveryStatusFilter,
): DeliveryStatus | undefined {
  return filter === ALL_DELIVERY_STATUSES ? undefined : filter;
}
