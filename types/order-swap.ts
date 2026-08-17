import { CampaignStatus } from "./marketing";
import type { UserRole, UserStatus } from "./user";

export type OrderStatus =
  | "In Transit"
  | "Pending Pickup"
  | "Disputed"
  | "Delivered";
export type BadgeStatus =
  | OrderStatus
  | "Active"
  | "Flagged"
  | "Pending"
  | "Approved"
  | "Pending Review"
  | "Open"
  | "Closed"
  | "Seller"
  | "Buyer"
  | "Resolved"
  | "In Progress"
  | "Paid"
  | "Yes"
  | "No"
  | "NGO"
  | "Paused"
  | "Not Delivered"
  | "Rejected"
  | UserStatus
  | UserRole
  | CampaignStatus;
export type DeliveryType =
  | "Doorstep Delivery"
  | "Inhouse Pickup"
  | "Pick Up Station";
export type TrackingStep = {
  label: string;
  status: "done" | "active" | "pending";
  note?: string;
};

export interface Order {
  id: string;
  item: string;
  category: string;
  buyer: string;
  seller: string;
  amount: number;
  deliveryMethod: string;
  deliveryType: DeliveryType;
  status: OrderStatus;
  date: string;
  paymentMethod: string;
  paidStatus: string;
  type: "Swap" | "Purchase";
  pickupAddress: string;
  expectedDelivery: string;
  buyerEmail: string;
  buyerUserId: string;
  sellerEmail: string;
  sellerUserId: string;
  trackingSteps: TrackingStep[];
}
