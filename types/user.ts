import type { Country } from "@/types/api/admin";

/**
 * The account kinds the dashboard filters and badges by. "Admin" covers staff
 * accounts, which are listed in the roles module rather than alongside platform
 * users.
 */
export type UserRole = "Individual" | "NGO" | "Delivery" | "Admin";
export type UserStatus = "Active" | "Suspended";

export type ModalType =
  | "suspend"
  | "unsuspend"
  | "delete"
  | "view"
  | "edit"
  | "changePassword"
  | null;

/**
 * A user row as shown in the dashboard.
 *
 * Fields the Admin API's list endpoint does not return are optional — the
 * detail endpoint (`GET /api/admin/users/{userId}`) fills them in when the
 * profile sheet opens. See `lib/adapters/user.ts` for the mapping.
 */
export interface User {
  /** The API's GUID, used for every per-user request. */
  id: string;
  /** Row number supplied by the API so paging keeps a stable count. */
  sn?: number;
  name: string;
  avatar?: string;
  /** Normalised for display; the API sends its own role names. */
  role: UserRole | string;
  code: string;
  email: string;
  phone?: string;
  balance: number;
  ecoPoints: number;
  listed?: boolean;
  status: UserStatus | string;
  accountHolderName?: string;
  accountNumber?: string;
  bankName?: string;
  sortCode?: string;
  iban?: string;
  swiftCode?: string;
  cacNumber?: string;
  trend?: "up" | "down";
  /** Detail-only figures, present once the profile has been fetched. */
  totalListings?: number;
  totalSold?: number;
  totalPurchased?: number;
  signupDate?: string;
  lastActive?: string;
  emailVerified?: boolean;
  kycStatus?: string;
}
export interface ViewUserSheetProps {
  user: User;
  open: boolean;
  onClose: () => void;
  editMode?: boolean;
  onEdit?: () => void;
}

export type DeliveryPartnerStep = "contact" | "documents" | "location";

export type AccountValidationStatus =
  | "idle"
  | "validating"
  | "success"
  | "error";

/**
 * Where a Delivery has got to, as the cards read it. Distinct from
 * `OrderStatus` in `./order`: an Order can be Disputed, which is a state of the
 * trade rather than the movement, and a Delivery can end Not Delivered while
 * the Order stands.
 */
export type DeliveryStatus =
  | "Pending"
  | "In Transit"
  | "Delivered"
  | "Not Delivered";

/**
 * One of a delivery partner's orders, as its card renders it.
 *
 * Mapped from `DeliveryPartnerOrderDto` in `lib/adapters/delivery-partner.ts`.
 * The endpoint names the item and the two ends of the journey and nothing else
 * about the goods — no photo, no condition, no second line — so those are
 * absent here rather than optional fields the card would always draw empty.
 */
export interface DeliveryPartnerOrder {
  id: string;
  /** The short order number the API assigns, e.g. `1042`. */
  orderNumber?: number;
  itemName: string;
  price: number;
  currency: string;
  pickup: string;
  dropoff: string;
  status: DeliveryStatus | string;
  /** Set only when the delivery ended Not Delivered. */
  reason?: string;
  date: string;
}

/** A file already uploaded, as the create/edit form lists it. */
export interface DeliveryPartnerDocument {
  id: string;
  name: string;
  url: string;
}

/**
 * A file on a delivery partner's record, as the Documents tab renders it.
 *
 * Mapped from `DeliveryPartnerDocumentDto` — which, unlike a rider's
 * verification profile, carries a real URL, so the row can offer the file
 * rather than only reporting that one was submitted.
 */
export interface DeliveryPartnerDocumentRow {
  id: string;
  /** The document type, humanised — "Proof Of Address". */
  label: string;
  fileName?: string;
  /** Absent when the API stored the record without a retrievable file. */
  url?: string;
  size?: string;
  uploadedOn: string;
}

export interface DeliveryPartner {
  id: string;
  organizationName: string;
  contactPersonName: string;
  email: string;
  phone: string;
  registrationNumber: string;
  utrNumber: string;
  profileImageUrl?: string;
  accountRole: string;
  signupDate: string;
  lastActive: string;
  accountStatus: "active" | "suspended";
  emailVerified: boolean;
  kycStatus: "verified" | "pending" | "rejected";
  bank: {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    sortCode?: string;
    iban?: string;
    swiftCode?: string;
  };
  location: {
    /** The API's own enum member, as the create and update bodies expect. */
    country: Country;
    state?: string;
    lga?: string;
    region?: string;
    city: string;
    area: string;
  };
  documents: DeliveryPartnerDocument[];
  totalListings: number;
  totalOrders: number;
  walletFunds: number;
  orders: DeliveryPartnerOrder[];
}

/** Values collected across all three steps of the create/edit flow. */
export interface DeliveryPartnerFormValues {
  profileImage?: File | null;
  contactPersonName: string;
  email: string;
  phone: string;
  businessName: string;
  utrNumber: string;

  registrationNumber: string;
  documents: File[];
  existingDocuments: DeliveryPartnerDocument[];
  bankName: string;
  /**
   * The payment gateway's code for the bank, from
   * `GET /api/admin/delivery-partners/banks`. Resolving an account number and
   * creating the partner both key off this rather than the name.
   */
  bankCode: string;
  bankAccountNumber: string;
  /** The name the bank holds for the account, once resolved. */
  accountHolderName?: string;

  /** The API's own enum member, so `UnitedKingdom` is stored unspaced. */
  country: Country;
  state?: string;
  lga?: string;
  region?: string;
  city: string;
  area: string;
  verifyEmailAutomatically: boolean;
}

export interface CreatedRiderCredentials {
  email: string;
  password: string;
}

export interface NgoDocument {
  id: string;
  name: string;
  url: string;
}

export type NgoStep = "contact" | "documents";

export interface NgoFormValues {
  profileImage?: File | null;
  organisationName: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;

  /** Required by the create endpoint, so the form has to collect it. */
  registrationNumber: string;
  postalCode: string;
  organizationAddress: string;
  documents: File[];
  existingDocuments: NgoDocument[];
}

export type Tab = "Profile" | "Listing (12)" | "Wallet History";
export type ListingFilter =
  | "All"
  | "Sell"
  | "Swap"
  | "Donate"
  | DeliveryStatus;
export type WalletFilter = "All" | "Credit" | "Debit";
