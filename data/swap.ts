import { type DeliveryType, type Order, type OrderStatus, type TrackingStep } from "@/types/order-swap";
const DOORSTEP_STEPS: TrackingStep[] = [
  { label: "Order Placed", status: "done" },
  { label: "Deposit Secured", status: "done" },
  { label: "Shipped", status: "active", note: "In progress..." },
  { label: "Confirm Receipt", status: "pending" },
];
 
const PICKUP_STEPS: TrackingStep[] = [
  { label: "Order Placed", status: "done" },
  { label: "Deposit Secured", status: "done" },
  { label: "Package Packed", status: "active", note: "In progress..." },
  { label: "Pickup by Customer", status: "pending" },
];
 
export const ORDERS: Order[] = Array.from({ length: 20 }, (_, i) => {
  const statuses: OrderStatus[] = ["In Transit", "Pending Pickup", "Disputed", "Delivered"];
  const deliveryTypes: DeliveryType[] = ["Doorstep Delivery", "Inhouse Pickup", "Pick Up Station"];
  const methods = ["GIG Logistics", "Doorstep Delivery", "Pick Up Station", "GIG Logistic"];
  const status = statuses[i % 4];
  const deliveryType = deliveryTypes[i % 3];
  const isPickup = deliveryType === "Inhouse Pickup";
 
  return {
    id: `TRX123-0${String(i + 1).padStart(2, "0")}`,
    item: "Iphone 15 Pro Max",
    category: "Electronics",
    buyer: "Tayo Igbira",
    seller: "Adejumo Adeyemi",
    amount: 125000,
    deliveryMethod: methods[i % 4],
    deliveryType,
    status,
    date: "Feb 7, 2026",
    paymentMethod: "Wallet",
    paidStatus: "On Hold",
    type: "Swap",
    pickupAddress: "8, Oluwalogbo Street, Isolo",
    expectedDelivery: "Feb 11, 2026",
    buyerEmail: "adebayo123@gmail.com",
    buyerUserId: "USR-451",
    sellerEmail: "taiwoigbira@gmail.com",
    sellerUserId: "USR-451",
    trackingSteps: isPickup ? PICKUP_STEPS : DOORSTEP_STEPS,
  };
});
 