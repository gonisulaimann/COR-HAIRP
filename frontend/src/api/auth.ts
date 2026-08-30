/**
 * Authentication API Module
 * ═════════════════════════
 *
 * Typed API functions for COR-HARP authentication endpoints.
 * All functions return promises that resolve to the typed response
 * matching the Pydantic models in backend/schemas.py.
 *
 * Authentication Flow
 * ───────────────────
 * 1. Login:     POST /api/auth/login     → session data
 * 2. Register:  POST /api/auth/register  → OTP sent via email
 * 3. Verify:    POST /api/auth/verify-otp → account created
 * 4. Recovery:  POST /api/auth/forgot-password → notification sent
 *
 * Admin Bypass
 * ────────────
 * credentials email='admin' password='admin' bypass all checks
 * and return immediately with ADMIN clearance.
 */
import type {
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterResponse,
  UserOut,
  VerifyOtpResponse,
} from "@/types";
import client from "./client";

/**
 * Authenticate with email and password.
 *
 * On success, returns user ID, name, clearance level, and onboarding status.
 * The admin/admin bypass returns immediately without database lookup.
 *
 * @param data - Login credentials (email + password)
 * @returns Login response with user session data
 */
export const login = (data: LoginRequest): Promise<LoginResponse> =>
  client.post("/auth/login", data);

/**
 * Start the registration process.
 *
 * Validates the email format, generates a 6-digit OTP, and sends it
 * via SendGrid. The OTP expires after 5 minutes. Call verifyOtp()
 * with the received code to complete registration.
 *
 * @param data - Registration details (name, email, password)
 * @returns Success message indicating OTP was sent
 */
export const register = (data: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResponse> => client.post("/auth/register", data);

/**
 * Verify the 6-digit OTP code and complete registration.
 *
 * If the OTP is valid and not expired, the account is created and
 * user session data is returned. If invalid or expired, returns
 * an error message prompting re-registration.
 *
 * @param data - Email and the 6-digit OTP code
 * @returns Verification result with user data on success
 */
export const verifyOtp = (data: {
  email: string;
  otp_code: string;
}): Promise<VerifyOtpResponse> => client.post("/auth/verify-otp", data);

/**
 * Request a password recovery notification.
 *
 * This is currently a mock implementation that sends a notification
 * email without actually resetting the password. The response always
 * indicates success to prevent email enumeration.
 *
 * @param email - The email address for recovery
 * @returns Success message (always returns success for security)
 */
export const forgotPassword = (
  email: string,
): Promise<ForgotPasswordResponse> =>
  client.post("/auth/forgot-password", { email });

/**
 * Mark onboarding tour as completed for a user.
 *
 * Called when the user dismisses or completes the introductory tour
 * so it does not show again on subsequent logins.
 *
 * @param user_id - The user's database ID
 * @returns Success confirmation
 */
export const completeOnboarding = (
  user_id: number,
): Promise<{ success: boolean }> =>
  client.post("/auth/onboarding-complete", { user_id });

/**
 * List all registered users (admin endpoint).
 *
 * Returns user ID, name, email, registration date, clearance level,
 * and onboarding status for every account in the system.
 *
 * @returns Array of user objects
 */
export const listUsers = (): Promise<UserOut[]> => client.get("/auth/users");
