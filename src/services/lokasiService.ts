import { request, requestPaginated } from './api';
import { resourcePath, type PaginationParams, type ResourceId } from './apiHelpers';
import type { Lokasi, ResponsApi, ResponsApiPaginated } from '@/types';

export interface LokasiPayload {
  nama: string;
  latitude: number;
  longitude: number;
  deskripsi?: string | null;
  biaya_pengiriman: number;
}

export function listLokasi(
  params?: PaginationParams,
): Promise<ResponsApiPaginated<Lokasi>> {
  return requestPaginated<Lokasi>('/lokasi', params);
}

export function getLokasi(id: ResourceId): Promise<ResponsApi<Lokasi>> {
  return request<Lokasi>(resourcePath('/lokasi/', id));
}

export function createLokasi(
  payload: LokasiPayload,
): Promise<ResponsApi<Lokasi>> {
  return request<Lokasi>('/lokasi', 'POST', payload);
}

export function updateLokasi(
  id: ResourceId,
  payload: Partial<LokasiPayload>,
): Promise<ResponsApi<Lokasi>> {
  return request<Lokasi>(resourcePath('/lokasi/', id), 'PUT', payload);
}

export function updateBiayaPengiriman(
  id: ResourceId,
  biaya_pengiriman: number,
): Promise<ResponsApi<Lokasi>> {
  return request<Lokasi>(
    `${resourcePath('/lokasi/', id)}/biayaPengiriman`,
    'PUT',
    { biaya_pengiriman },
  );
}

export function deleteLokasi(id: ResourceId): Promise<ResponsApi<null>> {
  return request<null>(resourcePath('/lokasi/', id), 'DELETE');
}
