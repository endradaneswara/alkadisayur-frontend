import { request, requestPaginated } from './api';
import { resourcePath, type PaginationParams, type ResourceId } from './apiHelpers';
import type {
  Pengguna,
  PenggunaLogin,
  ResponsApi,
  ResponsApiPaginated,
} from '@/types';

export function listPengguna(
  params?: PaginationParams,
): Promise<ResponsApiPaginated<Pengguna>> {
  return requestPaginated<Pengguna>('/users', params);
}

export function getPengguna(id: ResourceId): Promise<ResponsApi<Pengguna>> {
  return request<Pengguna>(resourcePath('/users/', id));
}

export function updateRolePengguna(
  id: ResourceId,
  role: PenggunaLogin['role'],
): Promise<ResponsApi<Pengguna>> {
  return request<Pengguna>(`${resourcePath('/users/', id)}/role`, 'PUT', {
    role,
  });
}
