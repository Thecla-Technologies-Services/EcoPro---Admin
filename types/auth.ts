/**
 * Shapes returned by the Admin API (swagger: /swagger/admin/swagger.json).
 * Every endpoint wraps its payload in the same envelope.
 */
export interface ApiResponse<T = null> {
  isSuccess: boolean;
  errorCode: string | null;
  statusCode: string;
  message: string | null;
  devMessage: string | null;
  data: T;
}

/** POST /api/admin/auth/login and /api/admin/auth/verify-otp */
export interface AuthResponseDto {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  emailConfirmed: boolean;
  phoneNumberConfirmed: boolean;
  token: string | null;
  refreshToken: string | null;
  refreshTokenExpiryTime: string | null;
  role: string | null;
  userType: string | null;
  country: string | null;
  permissions: string[] | null;
  twoFactorEnabled: boolean;
  profilePictureKey: string | null;
  profilePictureUrl: string | null;
  onboardingStep: string | null;
  isOnboardingCompleted: boolean;
  mustChangePassword: boolean;
  hasTransactionPin: boolean;
}

/** POST /api/admin/auth/resend-otp */
export interface OtpSendResult {
  success: boolean;
  error: string | null;
  retryAfterSeconds: number | null;
  expiresAt: string | null;
}

/**
 * The subset of AuthResponseDto we keep in a cookie for rendering.
 * Deliberately excludes the tokens — those live in separate httpOnly cookies
 * and are never handed to the browser.
 */
export interface AdminSession {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string | null;
  permissions: string[];
  profilePictureUrl: string | null;
  mustChangePassword: boolean;
}
