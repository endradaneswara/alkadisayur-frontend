import { request } from './api';
import type { Dashboard, ResponsApi } from '@/types';

export function getDashboard(): Promise<ResponsApi<Dashboard>> {
  return request<Dashboard>('/dashboard');
}
