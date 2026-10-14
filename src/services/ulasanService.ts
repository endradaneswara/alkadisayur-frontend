import { request, requestPaginated } from './api';
import { resourcePath, type PaginationParams, type ResourceId } from './apiHelpers';
import type { ResponsApi, ResponsApiPaginated, Ulasan } from '@/types';

export interface UlasanPayload {
  rating: number;
  komentar?: string | null;
}

export function listUlasan(
  params?: PaginationParams,
): Promise<ResponsApiPaginated<Ulasan>> {
  return requestPaginated<Ulasan>('/ulasan', params);
}

export function getUlasan(id: ResourceId): Promise<ResponsApi<Ulasan>> {
  return request<Ulasan>(resourcePath('/ulasan/', id));
}

export function createUlasan(
  payload: UlasanPayload,
): Promise<ResponsApi<Ulasan>> {
  return request<Ulasan>('/ulasan', 'POST', payload);
}

export function updateUlasan(
  id: ResourceId,
  payload: UlasanPayload,
): Promise<ResponsApi<Ulasan>> {
  return request<Ulasan>(resourcePath('/ulasan/', id), 'PUT', payload);
}

export function deleteUlasan(id: ResourceId): Promise<ResponsApi<null>> {
  return request<null>(resourcePath('/ulasan/', id), 'DELETE');
}
