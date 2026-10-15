import {
  API_BASE_URL,
  clearAuthSession,
  request,
  setAuthSession,
} from './api';
import type { ResponsApi, ResponsAutentikasi } from '@/types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginPayload {
  login: string;
  password: string;
}

export async function register(
  payload: RegisterPayload,
): Promise<ResponsApi<ResponsAutentikasi>> {
  const response = await request<ResponsAutentikasi>(
    '/register',
    'POST',
    payload,
  );
  setAuthSession();
  return response;
}

export async function login(
  payload: LoginPayload,
): Promise<ResponsApi<ResponsAutentikasi>> {
  const response = await request<ResponsAutentikasi>('/login', 'POST', payload);
  setAuthSession();
  return response;
}

export async function logout(): Promise<ResponsApi<null>> {
  const response = await request<null>('/logout', 'POST');
  clearAuthSession();
  return response;
}

export function googleUrl(): string {
  return `${API_BASE_URL}/auth/google`;
}

export { clearAuthSession as clearSession, setAuthSession as setSession };
