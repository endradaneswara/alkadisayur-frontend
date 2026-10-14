import { request, requestPaginated } from './api';
import { resourcePath, type PaginationParams, type ResourceId } from './apiHelpers';
import type {
  MetodePesanan,
  Pesanan,
  ResponsApi,
  ResponsApiPaginated,
  StatusPesanan,
} from '@/types';

export interface PesananPayload {
  alamat_id?: number | null;
  lokasi_toko_id: number;
  metode: MetodePesanan;
  catatan?: string | null;
}

export function listPesanan(
  params?: PaginationParams,
): Promise<ResponsApiPaginated<Pesanan>> {
  return requestPaginated<Pesanan>('/pesanan', params);
}

export function createPesanan(
  payload: PesananPayload,
): Promise<ResponsApi<Pesanan>> {
  return request<Pesanan>('/pesanan', 'POST', payload);
}

export function getPesanan(id: ResourceId): Promise<ResponsApi<Pesanan>> {
  return request<Pesanan>(resourcePath('/pesanan/', id));
}

export function cancelPesanan(id: ResourceId): Promise<ResponsApi<Pesanan>> {
  return request<Pesanan>(resourcePath('/pesanan/', id), 'DELETE');
}

export function listAdminPesanan(
  params?: PaginationParams,
): Promise<ResponsApiPaginated<Pesanan>> {
  return requestPaginated<Pesanan>('/admin/pesanan', params);
}

export function getAdminPesanan(id: ResourceId): Promise<ResponsApi<Pesanan>> {
  return request<Pesanan>(resourcePath('/admin/pesanan/', id));
}

export function updateAdminPesananStatus(
  id: ResourceId,
  status: StatusPesanan,
): Promise<ResponsApi<Pesanan>> {
  return request<Pesanan>(`${resourcePath('/admin/pesanan/', id)}/status`, 'PUT', {
    status,
  });
}
