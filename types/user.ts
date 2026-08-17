export type UserRole = "Individual" | "NGO" | "Delivery";
export type UserStatus = "Active" | "Suspended";

export type ModalType =
  | "suspend"
  | "unsuspend"
  | "delete"
  | "view"
  | "edit"
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

export interface EditUserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  accountRole: string;
  accountStatus: string;
}

export type DeliveryPartnerStep = "contact" | "documents" | "location";

export type AccountValidationStatus =
  | "idle"
  | "validating"
  | "success"
  | "error";

export type OrderStatus =
  | "Pending"
  | "In Transit"
  | "Delivered"
  | "Not Delivered";

export interface DeliveryPartnerOrder {
  id: string;
  itemName: string;
  itemSubtitle: string;
  condition: string;
  price: number;
  imageUrl: string;
  pickup: string;
  dropoff: string;
  status: OrderStatus;
  reason?: string;
}

export interface DeliveryPartnerDocument {
  id: string;
  name: string;
  url: string;
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
    country: string;
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
  bankAccountNumber: string;
  accountHolderName?: string;

  country: string;
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

export type DonationStatus = "completed" | "pending" | "failed";

export interface NgoDocument {
  id: string;
  name: string;
  url: string;
}

export interface NgoDonation {
  id: string;
  donorName: string;
  amount: number;
  date: string;
  method: string;
  status: DonationStatus;
}

export interface Ngo {
  id: string;
  organisationName: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  profileImageUrl?: string;
  postalCode: string;
  organizationAddress: string;
  accountRole: string;
  signupDate: string;
  lastActive: string;
  accountStatus: "active" | "suspended";
  emailVerified: boolean;
  kycStatus: "verified" | "pending" | "rejected";
  documents: NgoDocument[];
  totalDonationsReceived: number;
  totalDonors: number;
  donations: NgoDonation[];
}

export interface NgoFormValues {
  profileImage?: File | null;
  organisationName: string;
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;

  postalCode: string;
  organizationAddress: string;
  documents: File[];
  existingDocuments: NgoDocument[];
}

export interface CreatedNgoCredentials {
  email: string;
  password: string;
}


export type Tab = "Profile" | "Listing (12)" | "Wallet History";
export type ListingFilter =
  | "All"
  | "Sell"
  | "Swap"
  | "Donate"
  | "Pending"
  | "In Transit"
  | "Delivered"
  | "Not Delivered";
export type WalletFilter = "All" | "Credit" | "Debit";
