import { request } from './api';
import { buildQuery } from './apiHelpers';
import type { Dashboard, RentangGrafik, ResponsApi } from '@/types';

export function getDashboard(
  rentang?: RentangGrafik,
  lokasi_id?: number | null,
): Promise<ResponsApi<Dashboard>> {
  return request<Dashboard>(`/dashboard${buildQuery({ rentang, lokasi_id })}`);
}
