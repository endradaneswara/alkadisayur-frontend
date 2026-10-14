import { request, requestPaginated } from './api';
import { resourcePath, type PaginationParams, type ResourceId } from './apiHelpers';
import type {
  MetodePembayaran,
  Pembayaran,
  ResponsApi,
  ResponsApiPaginated,
  StatusPembayaran,
} from '@/types';

export interface PembayaranPayload {
  pesanan_id: number;
  metode_pembayaran: MetodePembayaran;
}

export function listPembayaran(
  params?: PaginationParams,
): Promise<ResponsApiPaginated<Pembayaran>> {
  return requestPaginated<Pembayaran>('/pembayaran', params);
}

export function createPembayaran(
  payload: PembayaranPayload,
): Promise<ResponsApi<Pembayaran>> {
  return request<Pembayaran>('/pembayaran', 'POST', payload);
}

export function getPembayaran(
  id: ResourceId,
): Promise<ResponsApi<Pembayaran>> {
  return request<Pembayaran>(resourcePath('/pembayaran/', id));
}

export function updateStatusPembayaran(
  id: ResourceId,
  status: StatusPembayaran,
): Promise<ResponsApi<Pembayaran>> {
  return request<Pembayaran>(resourcePath('/pembayaran/', id), 'PUT', { status });
}
