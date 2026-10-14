import { request, requestPaginated } from './api';
import { resourcePath, type PaginationParams, type ResourceId } from './apiHelpers';
import type {
  BarangCustomer,
  Kategori,
  ResponsApi,
  ResponsApiPaginated,
} from '@/types';

export interface KategoriPayload {
  nama_kategori: string;
}

export function listKategori(
  params?: PaginationParams,
): Promise<ResponsApiPaginated<Kategori>> {
  return requestPaginated<Kategori>('/kategori', params);
}

export function getKategori(id: ResourceId): Promise<ResponsApi<Kategori>> {
  return request<Kategori>(resourcePath('/kategori/', id));
}

export function listBarangByKategori(
  id: ResourceId,
  params?: PaginationParams,
): Promise<ResponsApiPaginated<BarangCustomer>> {
  return requestPaginated<BarangCustomer>(
    `${resourcePath('/kategori/', id)}/barang`,
    params,
  );
}

export function createKategori(
  payload: KategoriPayload,
): Promise<ResponsApi<Kategori>> {
  return request<Kategori>('/kategori', 'POST', payload);
}

export function updateKategori(
  id: ResourceId,
  payload: KategoriPayload,
): Promise<ResponsApi<Kategori>> {
  return request<Kategori>(resourcePath('/kategori/', id), 'PUT', payload);
}

export function deleteKategori(id: ResourceId): Promise<ResponsApi<null>> {
  return request<null>(resourcePath('/kategori/', id), 'DELETE');
}
