import { request } from './api';
import type { PenggunaLogin, ResponsApi } from '@/types';

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  no_hp?: string;
  avatar?: string;
}

export function getProfile(): Promise<ResponsApi<PenggunaLogin>> {
  return request<PenggunaLogin>('/profile');
}

export function updateProfile(
  payload: UpdateProfilePayload,
): Promise<ResponsApi<PenggunaLogin>> {
  return request<PenggunaLogin>('/profile', 'PUT', payload);
}
