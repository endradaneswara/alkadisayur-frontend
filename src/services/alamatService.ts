import { request, requestPaginated } from './api';
import { resourcePath, type PaginationParams, type ResourceId } from './apiHelpers';
import type { Alamat, ResponsApi, ResponsApiPaginated } from '@/types';

export interface AlamatPayload {
  nama_alamat: string;
  nama_penerima: string;
  no_hp: string;
  alamat_lengkap: string;
}

export function listAlamat(
  params?: PaginationParams,
): Promise<ResponsApiPaginated<Alamat>> {
  return requestPaginated<Alamat>('/alamat', params);
}

export function getAlamat(id: ResourceId): Promise<ResponsApi<Alamat>> {
  return request<Alamat>(resourcePath('/alamat/', id));
}

export function createAlamat(
  payload: AlamatPayload,
): Promise<ResponsApi<Alamat>> {
  return request<Alamat>('/alamat', 'POST', payload);
}

export function updateAlamat(
  id: ResourceId,
  payload: Partial<AlamatPayload>,
): Promise<ResponsApi<Alamat>> {
  return request<Alamat>(resourcePath('/alamat/', id), 'PUT', payload);
}

export function deleteAlamat(id: ResourceId): Promise<ResponsApi<null>> {
  return request<null>(resourcePath('/alamat/', id), 'DELETE');
}
