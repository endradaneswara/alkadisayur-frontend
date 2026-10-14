import { request } from './api';
import type { ResponsApi } from '@/types';

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

export interface UpdatePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

export function forgotPassword(email: string): Promise<ResponsApi<null>> {
  return request<null>('/forgot-password', 'POST', { email });
}

export function resetPassword(
  payload: ResetPasswordPayload,
): Promise<ResponsApi<null>> {
  return request<null>('/reset-password', 'POST', payload);
}

export function updatePassword(
  payload: UpdatePasswordPayload,
): Promise<ResponsApi<null>> {
  return request<null>('/profile/password', 'PUT', payload);
}
