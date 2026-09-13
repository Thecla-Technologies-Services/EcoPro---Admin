import type {
  DeliveryPartnerDocumentDto,
  DeliveryPartnerOrderDto,
} from "@/types/api/admin";
import type {
  DeliveryPartnerDocumentRow,
  DeliveryPartnerOrder,
} from "@/types/user";
import { PLACEHOLDER, formatDate, humanise } from "@/lib/adapters/shared";

/**
 * Maps a row from `GET /delivery-partners/get-orders/{userId}` onto an order
 * card.
 *
 * `deliveryStatus` is typed as free text in the swagger even though the filter
 * parameter beside it is the closed `DeliveryStatus` enum, so the token is
 * split for display rather than matched against a label map — an unrecognised
 * one reads as itself instead of being forced into a bucket.
 */
export function toDeliveryPartnerOrder(
  dto: DeliveryPartnerOrderDto,
): DeliveryPartnerOrder {
  return {
    id: dto.orderId ?? "",
    orderNumber: dto.orderNumber,
    itemName: dto.itemTitle ?? PLACEHOLDER,
    price: dto.itemPrice ?? 0,
    currency: dto.currency ?? "",
    pickup: dto.pickupLabel ?? PLACEHOLDER,
    dropoff: dto.dropoffLabel ?? PLACEHOLDER,
    status: dto.deliveryStatus ? humanise(dto.deliveryStatus) : PLACEHOLDER,
    reason: dto.notDeliveredReason ?? undefined,
    date: formatDate(dto.createdOn),
  };
}

/** Bytes as the row renders them: `1.4 MB`, or nothing when the API omits it. */
function toFileSize(bytes: number | undefined): string | undefined {
  if (!bytes) return undefined;

  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }

  return `${size < 10 && unit > 0 ? size.toFixed(1) : Math.round(size)} ${units[unit]}`;
}

/**
 * Maps a document from `GET /delivery-partners/get/{userId}`.
 *
 * Unlike a rider's verification profile, which reports only whether each image
 * exists, these carry a real URL — so the row can offer the file rather than
 * just claiming it was submitted.
 */
export function toDeliveryPartnerDocument(
  dto: DeliveryPartnerDocumentDto,
): DeliveryPartnerDocumentRow {
  return {
    id: dto.id ?? dto.fileName ?? "",
    label: dto.documentType ? humanise(dto.documentType) : PLACEHOLDER,
    fileName: dto.fileName ?? undefined,
    url: dto.url ?? undefined,
    size: toFileSize(dto.fileSizeBytes),
    uploadedOn: formatDate(dto.createdOn),
  };
}
