import { request, requestPaginated } from './api';
import { resourcePath, type PaginationParams, type ResourceId } from './apiHelpers';
import type {
  Barang,
  BarangCustomer,
  ResponsApi,
  ResponsApiPaginated,
} from '@/types';

export interface BarangPayload {
  kategori_id: number;
  KodeItem: string;
  Barcode: string;
  SKU: string;
  NamaItem: string;
  Merek?: string | null;
  Stok: number;
  Rak?: string | null;
  TipeItem?: string | null;
  HargaBeli: number;
  HargaJual: number;
  Keterangan?: string | null;
  Foto?: string | null;
  Status: Barang['Status'];
}

export function listBarang<T extends Barang | BarangCustomer = BarangCustomer>(
  params?: PaginationParams,
): Promise<ResponsApiPaginated<T>> {
  return requestPaginated<T>('/barang', params);
}

export function getBarang<T extends Barang | BarangCustomer = BarangCustomer>(
  id: ResourceId,
): Promise<ResponsApi<T>> {
  return request<T>(resourcePath('/barang/', id));
}

export function createBarang(
  payload: BarangPayload | FormData,
): Promise<ResponsApi<Barang>> {
  return request<Barang>('/barang', 'POST', payload);
}

export function updateBarang(
  id: ResourceId,
  payload: Partial<BarangPayload> | FormData,
): Promise<ResponsApi<Barang>> {
  return request<Barang>(resourcePath('/barang/', id), 'PUT', payload);
}

export function deleteBarang(id: ResourceId): Promise<ResponsApi<null>> {
  return request<null>(resourcePath('/barang/', id), 'DELETE');
}
