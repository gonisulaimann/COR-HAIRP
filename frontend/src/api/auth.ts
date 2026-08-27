/**
 * auth.ts — Typed API functions for authentication endpoints.
 *
 * TEMP-DOCS: Every function here maps 1:1 to a POST/GET endpoint on
 * the FastAPI backend. Return types match backend/schemas.py exactly.
 */
import client from './client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterResponse,
  VerifyOtpResponse,
  ForgotPasswordResponse,
  UserOut,
} from '@/types';

/** Authenticate with email/password (admin/admin bypasses OTP). */
export const login = (data: LoginRequest): Promise<LoginResponse> =>
  client.post('/auth/login', data);

/** Start registration — sends OTP email, returns success/message. */
export const register = (data: {
  name: string;
  email: string;
  password: string;
}): Promise<RegisterResponse> => client.post('/auth/register', data);

/** Verify 6-digit OTP code and complete registration. */
export const verifyOtp = (data: {
  email: string;
  otp_code: string;
}): Promise<VerifyOtpResponse> => client.post('/auth/verify-otp', data);

/** Request password recovery (mock — sends notification only). */
export const forgotPassword = (email: string): Promise<ForgotPasswordResponse> =>
  client.post('/auth/forgot-password', { email });

/** Mark onboarding as completed for a user. */
export const completeOnboarding = (user_id: number): Promise<{ success: boolean }> =>
  client.post('/auth/onboarding-complete', { user_id });

/** List all registered users (admin endpoint). */
export const listUsers = (): Promise<UserOut[]> => client.get('/auth/users');
