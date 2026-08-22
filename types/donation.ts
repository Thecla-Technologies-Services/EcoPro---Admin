import type { DeliveryStatus } from "./user";


export interface DeliveryTimelineStep {
  label: string;
  status: "done" | "active" | "pending";
  subLabel?: string;
}


export type DonationType = "Material" | "Monetary";
export type DeliveryMethod = "Home Delivery" | "Pickup";
/** A Delivery's states, plus the one a monetary Donation ends in. */
export type DonationStatus = DeliveryStatus | "Paid";


export interface PersonDetails {
  name: string;
  email: string;
  role: string;
  userId: string;
  avatar?: string;
  verified?: boolean;
}


export interface DonationRecord {
  orderId: string;
  createdAt: string;
  item: string;
  itemCategory: string;
  itemImage?: string;
  description?: string;
  donor: string;
  recipient: string;
  type: DonationType;
  deliveryMethod?: DeliveryMethod;
  status: DonationStatus;
  date: string;
  // Material fields
  amount?: string;
  deliveryStatus?: DonationStatus;
  deliveryCompany?: string;
  destination?: string;
  pickupAddress?: string;
  expectedDeliveryDate?: string;
  deliveryTimeline?: DeliveryTimelineStep[];
  // Monetary fields
  monetaryAmount?: string;
  paymentMethod?: string;
  paidStatus?: string;
  // People
  donorDetails?: PersonDetails;
  recipientDetails?: PersonDetails;
  buyerDetails?: PersonDetails;
  sellerDetails?: PersonDetails;
}
