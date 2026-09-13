import type { SwapProposalDto, UserDto } from "@/types/api/admin";
import type { Order } from "@/types/order";
import { PLACEHOLDER, formatDate } from "@/lib/adapters/shared";

/** A party's display name, from the directory record behind their user id. */
function toPartyName(
  userId: string | undefined,
  usersById: Map<string, UserDto>,
): string {
  const user = userId ? usersById.get(userId) : undefined;
  if (!user) return PLACEHOLDER;

  return (
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.email ||
    PLACEHOLDER
  );
}

/**
 * Maps a row from `GET /api/admin/swaps/disputed` onto an order row.
 *
 * A stopgap, and a partial one: the endpoint returns swap proposals that are
 * under dispute, not orders. Two consequences worth holding on to —
 *
 * - every row is a swap, and every row is disputed, so the table's other tabs
 *   have nothing to show;
 * - the delivery half of an order has no source at all. Method, type, pickup
 *   address, expected delivery, payment method, paid status and the tracking
 *   timeline are not on a proposal, so they are placeholders rather than
 *   invented values, and the detail dialog says so where it can.
 *
 * The parties are ids on the DTO, so each is matched against the user
 * directory; an unmatched id reads as the placeholder rather than a uuid.
 */
export function toSwapOrder(
  dto: SwapProposalDto,
  usersById: Map<string, UserDto>,
): Order {
  const buyer = dto.proposerUserId ?? "";
  const seller = dto.sellerUserId ?? "";

  return {
    id: dto.id ?? "",
    // The proposal names what was offered, never the item it was offered
    // against — so this is the offered side, not the listing.
    item: dto.offeredItemDescription ?? PLACEHOLDER,
    category: PLACEHOLDER,
    buyer: toPartyName(buyer, usersById),
    seller: toPartyName(seller, usersById),
    // What is at stake: the item's value plus any cash on top.
    amount: (dto.targetItemValue ?? 0) + (dto.cashTopUp ?? 0),
    deliveryMethod: PLACEHOLDER,
    // The narrowest of the three, since none of them is known.
    deliveryType: "Doorstep Delivery",
    // Every row from this endpoint is under dispute, whatever the proposal's
    // own status says about the swap itself.
    status: "Disputed",
    date: formatDate(dto.createdOn),
    paymentMethod: PLACEHOLDER,
    // Both deposits paid is the closest the proposal comes to saying so.
    paidStatus: dto.proposerPaid && dto.sellerPaid ? "Paid" : PLACEHOLDER,
    type: "Swap",
    pickupAddress: PLACEHOLDER,
    expectedDelivery: PLACEHOLDER,
    buyerEmail: usersById.get(buyer)?.email ?? PLACEHOLDER,
    buyerUserId: buyer || PLACEHOLDER,
    sellerEmail: usersById.get(seller)?.email ?? PLACEHOLDER,
    sellerUserId: seller || PLACEHOLDER,
    // No delivery to track.
    trackingSteps: [],
  };
}
