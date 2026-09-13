/**
 * Types for the Ecoswap Admin API.
 *
 * Generated from /swagger/admin/swagger.json — do not edit by hand. The
 * `*ApiResponse` envelopes are omitted because `apiFetch` unwraps `data`;
 * see `ApiResponse<T>` in types/auth.ts for the envelope itself.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type Country =
  | "UnitedKingdom"
  | "Nigeria"
  | "Ghana";

export type DeliveryStatus =
  | "Pending"
  | "InTransit"
  | "Delivered"
  | "NotDelivered";

export type EditRequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Cancelled";

export type EditRequestTarget =
  | "UserProfile"
  | "OrganizationProfile";

export type Interest =
  | "Fashion"
  | "Books"
  | "Electronics"
  | "Tech"
  | "Furniture"
  | "Gaming"
  | "Kitchen"
  | "Sports"
  | "Home"
  | "Kids"
  | "Mobile";

export type ItemCondition =
  | "BrandNew"
  | "VeryGood"
  | "Fair";

export type ListingReportStatus =
  | "Pending"
  | "Dismissed"
  | "ActionTaken";

export type ListingStatus =
  | "Draft"
  | "Active"
  | "Reserved"
  | "Completed"
  | "Removed"
  | "Flagged"
  | "Sold"
  | "Swapped"
  | "Donated"
  | "Collected";

export type ListingType =
  | "Sell"
  | "Swap"
  | "Donate"
  | "Free";

export type OrganizationDocumentType =
  | "CacCertificate"
  | "RegistrationProof";

export type ReportStatus =
  | "Pending"
  | "Reviewed"
  | "Dismissed"
  | "Actioned";

export type SupportTicketStatus =
  | "Open"
  | "InProgress"
  | "Resolved";

export type SwapDisputeResolution =
  | "CompleteSwap"
  | "RefundBoth";

export type UserType =
  | "EcoWarrior"
  | "CharityPartner"
  | "LogisticsPartner"
  | "IndependentRider"
  | "Admin";

export type VerificationMethod =
  | "DriversLicense"
  | "VotersCard"
  | "NinSlip"
  | "Visa"
  | "ShareCodeLink"
  | "Passport"
  | "Pin";

export type WithdrawalStatus =
  | "Pending"
  | "PendingReview"
  | "Approved"
  | "Processing"
  | "Completed"
  | "Failed"
  | "Rejected";

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

export interface AdminDeliveryPartnerProfileDto {
  userId?: string;
  businessName?: string | null;
  contactPersonName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  registrationNumber?: string | null;
  utr?: string | null;
  bankName?: string | null;
  bankCode?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  country?: string | null;
  state?: string | null;
  lga?: string | null;
  city?: string | null;
  area?: string | null;
  kycStatus?: string | null;
  isActive?: boolean;
  createdOn?: string;
  walletFunds?: number;
  totalOrders?: number;
  documents?: DeliveryPartnerDocumentDto[] | null;
}

export interface AdminEditUserRequestDto {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  roleId?: string | null;
  isActive?: boolean;
}

export interface AdminListingItemDto {
  id?: string;
  title?: string | null;
  description?: string | null;
  categoryName?: string | null;
  condition?: string | null;
  size?: string | null;
  colour?: string | null;
  quantity?: number;
  brand?: string | null;
  ecoBenefit?: string | null;
  listingType?: string | null;
  status?: string | null;
  listedBy?: string | null;
  customerAccountCode?: string | null;
  price?: number;
  formattedPrice?: string | null;
  ecoImpactKgCo2?: number;
  formattedCo2Impact?: string | null;
  badge?: string | null;
  createdByAdmin?: boolean;
  viewCount?: number;
  timeAgo?: string | null;
  primaryImageUrl?: string | null;
  flagReason?: string | null;
  createdAt?: string;
}

export interface AdminListingItemDtoPaginatedResponseDto {
  data?: AdminListingItemDto[] | null;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface AdminListingListResponseDto {
  metrics?: AdminListingMetricsDto;
  listings?: AdminListingItemDtoPaginatedResponseDto;
}

export interface AdminListingMetricsDto {
  totalListings?: number;
  activeListings?: number;
  pendingApproval?: number;
  flaggedItems?: number;
}

export interface AdminUserDetailsDto {
  userId?: string;
  name?: string | null;
  email?: string | null;
  userCode?: string | null;
  profilePictureUrl?: string | null;
  totalListings?: number;
  totalSold?: number;
  totalPurchased?: number;
  walletFunds?: number;
  ecoPoints?: number;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  accountRole?: string | null;
  lastActive?: string | null;
  signupDate?: string;
  accountStatus?: string | null;
  isActive?: boolean;
  emailVerified?: boolean;
  kycStatus?: string | null;
  bankDetails?: BankDetailsDto;
}

export interface AdminUserListResponseDto {
  metrics?: AdminUserMetricsDto;
  users?: AdminUserSummaryDtoPaginatedResponseDto;
}

export interface AdminUserListingItemDto {
  id?: string;
  title?: string | null;
  listingType?: string | null;
  price?: number;
  publishedTimeAgo?: string | null;
  viewCount?: number;
  imageUrl?: string | null;
}

export interface AdminUserListingItemDtoPaginatedResponseDto {
  data?: AdminUserListingItemDto[] | null;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface AdminUserMetricsDto {
  totalUsers?: number;
  individualCount?: number;
  ngoPartners?: number;
  deliveryPartners?: number;
  suspendedCount?: number;
}

export interface AdminUserSummaryDto {
  id?: string;
  sn?: number;
  name?: string | null;
  profilePictureUrl?: string | null;
  role?: string | null;
  userCode?: string | null;
  email?: string | null;
  balance?: number;
  ecoPoints?: number;
  status?: string | null;
  isActive?: boolean;
  createdOn?: string;
  lastActive?: string | null;
}

export interface AdminUserSummaryDtoPaginatedResponseDto {
  data?: AdminUserSummaryDto[] | null;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface AdminUserTransactionDto {
  id?: string;
  title?: string | null;
  transactionType?: string | null;
  amount?: number;
  timeAgo?: string | null;
  iconType?: string | null;
  timestamp?: string;
}

export interface AdminUserTransactionDtoPaginatedResponseDto {
  data?: AdminUserTransactionDto[] | null;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface AdminVerificationItemDto {
  id?: string;
  referenceNumber?: string | null;
  applicantName?: string | null;
  applicantType?: string | null;
  contactEmail?: string | null;
  contactPhoneNumber?: string | null;
  submissionDate?: string;
  reviewedBy?: string | null;
  reviewDate?: string | null;
  status?: string | null;
}

export interface AdminVerificationItemDtoPaginatedResponseDto {
  data?: AdminVerificationItemDto[] | null;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface AdminVerificationListResponseDto {
  metrics?: AdminVerificationMetricsDto;
  queue?: AdminVerificationItemDtoPaginatedResponseDto;
}

export interface AdminVerificationMetricsDto {
  totalApplications?: number;
  pendingReview?: number;
  approved?: number;
  rejected?: number;
}

export interface BankAccountResolutionResult {
  success?: boolean;
  accountName?: string | null;
  message?: string | null;
}

export interface BankDetailsDto {
  accountHolderName?: string | null;
  accountNumber?: string | null;
  bankName?: string | null;
  sortCode?: string | null;
  iban?: string | null;
  swiftBicCode?: string | null;
}

export interface BankDto {
  name?: string | null;
  code?: string | null;
  slug?: string | null;
  country?: string | null;
  currency?: string | null;
}

export interface CreateAdminListingRequestDto {
  title: string;
  description: string;
  userId?: string | null;
  categoryId?: string | null;
  condition?: ItemCondition;
  listingType?: ListingType;
  price?: number | null;
  estimatedValue?: number | null;
  country?: Country;
  colour?: string | null;
  quantity?: number;
  brandId?: string | null;
  customBrandName?: string | null;
  ecoBenefitId?: string | null;
}

export interface CreateAdminUserRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  password?: string | null;
  roleId?: string | null;
  verifyEmailAutomatically?: boolean;
  country?: Country;
}

export interface CreateDeliveryPartnerRequestDto {
  contactPersonName: string;
  email: string;
  phoneNumber?: string | null;
  businessName: string;
  registrationNumber: string;
  utr?: string | null;
  bankName?: string | null;
  bankCode?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  country: Country;
  state?: string | null;
  lga?: string | null;
  city?: string | null;
  area?: string | null;
  password?: string | null;
  verifyEmailAutomatically?: boolean;
}

export interface CreateFaqArticleRequestDto {
  category: string;
  question: string;
  answer: string;
  sortOrder?: number;
}

export interface CreateRoleRequestDto {
  name: string;
  description?: string | null;
  permissionIds?: string[] | null;
}

export interface DashboardActionRequiredDto {
  id?: string;
  title?: string | null;
  subtitle?: string | null;
  timeAgo?: string | null;
  category?: string | null;
  actionType?: string | null;
  timestamp?: string;
}

export interface DashboardActionRequiredDtoPaginatedResponseDto {
  data?: DashboardActionRequiredDto[] | null;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface DashboardMetricsDto {
  totalUsers?: number;
  grossMerchandiseValue?: number;
  formattedGmv?: string | null;
  totalCo2SavedKg?: number;
  formattedCo2Saved?: string | null;
  activeDisputes?: number;
}

export interface DashboardOverviewDto {
  metrics?: DashboardMetricsDto;
  actionRequiredItems?: DashboardActionRequiredDto[] | null;
  pendingCounters?: DashboardPendingCountersDto;
  financialOverview?: MonthlyFinancialOverviewDto[] | null;
}

export interface DashboardPendingCountersDto {
  pendingVerificationsCount?: number;
  withdrawalRequestsCount?: number;
  totalUserPayout?: number;
  formattedTotalUserPayout?: string | null;
}

export interface DeleteRoleRequestDto {
  roleName?: string | null;
}

export interface DeleteUserRequestDto {
  targetEmail?: string | null;
}

export interface DeliveryPartnerCreatedResponseDto {
  profile?: AdminDeliveryPartnerProfileDto;
  generatedPassword?: string | null;
  credentialsEmailed?: boolean;
}

export interface DeliveryPartnerDocumentDto {
  id?: string;
  documentType?: string | null;
  fileName?: string | null;
  url?: string | null;
  fileSizeBytes?: number;
  createdOn?: string;
}

export interface DeliveryPartnerOrderDto {
  orderId?: string;
  orderNumber?: number;
  itemTitle?: string | null;
  itemPrice?: number;
  currency?: string | null;
  pickupLabel?: string | null;
  dropoffLabel?: string | null;
  deliveryStatus?: string | null;
  notDeliveredReason?: string | null;
  createdOn?: string;
}

export interface DeliveryPartnerOrderDtoPaginatedResponseDto {
  data?: DeliveryPartnerOrderDto[] | null;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface EditRequestDto {
  id?: string;
  userId?: string;
  userEmail?: string | null;
  userType?: string | null;
  country?: string | null;
  target?: string | null;
  status?: string | null;
  changes?: Record<string, unknown> | null;
  current?: Record<string, unknown> | null;
  requestedOn?: string;
  reviewedOn?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
}

export interface FaqArticleDto {
  id?: string;
  category?: string | null;
  question?: string | null;
  answer?: string | null;
  sortOrder?: number;
}

export interface FeatureSuggestionDto {
  id?: string;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  createdOn?: string;
}

export interface FeatureSuggestionDtoPaginatedResponseDto {
  data?: FeatureSuggestionDto[] | null;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface FlagListingRequestDto {
  reason: string;
}

export interface GroupedPermissionDto {
  category?: string | null;
  permissions?: PermissionDto[] | null;
}

export interface ListingReportDto {
  id?: string;
  listingId?: string;
  listingTitle?: string | null;
  listingStatus?: string | null;
  reporterUserId?: string;
  reason?: string | null;
  details?: string | null;
  status?: string | null;
  createdOn?: string;
  resolvedOn?: string | null;
  resolutionNote?: string | null;
}

export interface ListingReportDtoPaginatedResponseDto {
  data?: ListingReportDto[] | null;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface MonthlyFinancialOverviewDto {
  month?: string | null;
  revenue?: number;
  payout?: number;
}

export interface OrganizationDocumentDto {
  id?: string;
  documentType?: string | null;
  fileName?: string | null;
  contentType?: string | null;
  fileSizeBytes?: number;
  url?: string | null;
}

export interface OrganizationDto {
  id?: string;
  userId?: string;
  referenceNumber?: string | null;
  organizationType?: string | null;
  organizationName?: string | null;
  registrationNumber?: string | null;
  organizationAddress?: string | null;
  postalCode?: string | null;
  contactPersonName?: string | null;
  contactPhoneNumber?: string | null;
  contactEmail?: string | null;
  profileImageUrl?: string | null;
  totalListings?: number;
  totalDonations?: number;
  signupDate?: string | null;
  lastActive?: string | null;
  accountStatus?: string | null;
  emailVerified?: boolean;
  kycStatus?: string | null;
  bankName?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  sortCode?: string | null;
  iban?: string | null;
  swiftCode?: string | null;
  status?: string | null;
  submittedOn?: string | null;
  reviewedOn?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
  documents?: OrganizationDocumentDto[] | null;
}

export interface PayoutSettingsDto {
  reviewThresholdAmount?: number;
  currency?: string | null;
  isInstantPayoutEnabled?: boolean;
  lastUpdatedOn?: string;
}

export interface PermissionDto {
  id?: string;
  name?: string | null;
  description?: string | null;
  category?: string | null;
}

export interface ReportDto {
  id?: string;
  reporterUserId?: string;
  reportedUserId?: string;
  reason?: string | null;
  context?: string | null;
  status?: string | null;
  createdOn?: string;
  reviewedOn?: string | null;
}

export interface ReportDtoPaginatedResponseDto {
  data?: ReportDto[] | null;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface ResolveBankAccountRequestDto {
  accountNumber: string;
  bankCode: string;
  country?: Country;
}

export interface ResolveListingReportRequestDto {
  removeListing?: boolean;
  note?: string | null;
}

export interface ResolveReportRequestDto {
  status: ReportStatus;
}

export interface ResolveSupportTicketRequestDto {
  status: SupportTicketStatus;
  note?: string | null;
}

export interface ResolveSwapDisputeRequestDto {
  resolution: SwapDisputeResolution;
  note?: string | null;
}

export interface ReviewEditRequestDto {
  approve: boolean;
  rejectionReason?: string | null;
}

export interface ReviewOrganizationRequestDto {
  approve: boolean;
  rejectionCategory?: string | null;
  additionalNotes?: string | null;
  rejectionReason?: string | null;
}

export interface ReviewRiderRequestDto {
  approve: boolean;
  rejectionReason?: string | null;
}

export interface RiderProfileDto {
  id?: string;
  userId?: string;
  status?: string | null;
  verificationMethod?: string | null;
  idNumber?: string | null;
  hasIdFrontImage?: boolean;
  hasIdBackImage?: boolean;
  hasSelfie?: boolean;
  hasProofOfAddress?: boolean;
  proofOfAddressType?: string | null;
  utr?: string | null;
  livenessPassed?: boolean | null;
  faceMatchScore?: number | null;
  livenessConfidence?: number | null;
  documentConfidence?: number | null;
  documentExpiry?: string | null;
  stage?: string | null;
  nextStep?: string | null;
  verificationReference?: string | null;
  submittedOn?: string | null;
  reviewedOn?: string | null;
  rejectionReason?: string | null;
}

export interface RoleDetailsDto {
  id?: string;
  name?: string | null;
  description?: string | null;
  participantType?: string | null;
  isEditable?: boolean;
  assignedPermissionIds?: string[] | null;
  groupedPermissions?: GroupedPermissionDto[] | null;
  createdAt?: string;
}

export interface RoleListResponseDto {
  metrics?: RoleMetricsDto;
  roles?: RoleSummaryDtoPaginatedResponseDto;
}

export interface RoleMetricsDto {
  totalRoles?: number;
  pendingPickup?: number;
  inTransit?: number;
  completed?: number;
}

export interface RoleSummaryDto {
  id?: string;
  sn?: number;
  name?: string | null;
  description?: string | null;
  permissionSummary?: string | null;
  isEditable?: boolean;
  createdAt?: string;
}

export interface RoleSummaryDtoPaginatedResponseDto {
  data?: RoleSummaryDto[] | null;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface SupportTicketDto {
  id?: string;
  category?: string | null;
  description?: string | null;
  attachmentUrl?: string | null;
  status?: string | null;
  createdOn?: string;
  reviewedOn?: string | null;
}

export interface SupportTicketDtoPaginatedResponseDto {
  data?: SupportTicketDto[] | null;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface SuspendUserRequestDto {
  reason?: string | null;
}

export interface SwapEscrowSettingsDto {
  depositPercentOfValue?: number;
  platformFee?: number;
  platformFeeRefundable?: boolean;
  bothPartiesPayPlatformFee?: boolean;
  depositWindowHours?: number;
  escrowConfirmationWindowDays?: number;
}

export interface SwapPartyTermsDto {
  deposit?: number;
  platformFee?: number;
  cashTopUp?: number;
  total?: number;
}

export interface SwapProposalDto {
  id?: string;
  listingId?: string;
  offeredListingId?: string;
  conversationId?: string;
  proposerUserId?: string;
  sellerUserId?: string;
  offeredItemDescription?: string | null;
  offeredItemValue?: number;
  targetItemValue?: number;
  cashTopUp?: number | null;
  currency?: string | null;
  status?: string | null;
  expiresAt?: string | null;
  createdOn?: string;
  proposerDeposit?: number;
  sellerDeposit?: number;
  proposerPaid?: boolean;
  sellerPaid?: boolean;
  proposerConfirmedReceipt?: boolean;
  sellerConfirmedReceipt?: boolean;
  yourTerms?: SwapPartyTermsDto;
}

export interface SwapProposalDtoPaginatedResponseDto {
  data?: SwapProposalDto[] | null;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
  totalRecords?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface UpdateDeliveryPartnerRequestDto {
  contactPersonName: string;
  email: string;
  phoneNumber?: string | null;
  businessName: string;
  registrationNumber: string;
  utr?: string | null;
  bankName?: string | null;
  bankCode?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  country: Country;
  state?: string | null;
  lga?: string | null;
  city?: string | null;
  area?: string | null;
}

export interface UpdatePayoutSettingsRequestDto {
  reviewThresholdAmount?: number;
  currency?: string | null;
  isInstantPayoutEnabled?: boolean;
}

export interface UpdateRoleRequestDto {
  name: string;
  description?: string | null;
  permissionIds?: string[] | null;
}

export interface UpdateSwapEscrowSettingsRequestDto {
  depositPercentOfValue?: number;
  platformFee?: number;
  platformFeeRefundable?: boolean;
  bothPartiesPayPlatformFee?: boolean;
  depositWindowHours?: number;
  escrowConfirmationWindowDays?: number;
}

export interface UpdateVerificationMethodRequestDto {
  country: Country;
  method: VerificationMethod;
  isEnabled: boolean;
  requiresDocumentUpload: boolean;
  requiresSelfie: boolean;
  requiresProofOfAddress: boolean;
}

export interface UserDto {
  id?: string;
  firstName?: string | null;
  lastName?: string | null;
  middleName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  gender?: string | null;
  isActive?: boolean;
  isProfileCompleted?: boolean;
  emailConfirmed?: boolean;
  phoneNumberConfirmed?: boolean;
  twoFactorEnabled?: boolean;
  dateOfBirth?: string | null;
  address?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  designation?: string | null;
  userType?: string | null;
  onboardingStep?: string | null;
  isOnboardingCompleted?: boolean;
  locationEnabled?: boolean;
  profilePictureKey?: string | null;
  profilePictureUrl?: string | null;
  createdOn?: string | null;
  updatedOn?: string | null;
  lastLoginDate?: string | null;
  userCode?: string | null;
  mustChangePassword?: boolean;
  roles?: string[] | null;
  interests?: Interest[] | null;
}

export interface VerificationMethodConfigDto {
  country?: string | null;
  method?: string | null;
  isEnabled?: boolean;
  requiresDocumentUpload?: boolean;
  requiresSelfie?: boolean;
  requiresProofOfAddress?: boolean;
}

export interface WithdrawalRequestDto {
  id?: string;
  reference?: string | null;
  amount?: number;
  fee?: number;
  totalDeducted?: number;
  currency?: string | null;
  status?: WithdrawalStatus;
  bankName?: string | null;
  sortCode?: string | null;
  accountNumber?: string | null;
  accountName?: string | null;
  requestedOn?: string;
  processedOn?: string | null;
}
