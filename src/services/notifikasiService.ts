import { request, requestPaginated } from './api';
import { resourcePath, type PaginationParams, type ResourceId } from './apiHelpers';
import type { Notifikasi, ResponsApi, ResponsApiPaginated } from '@/types';

export function listNotifikasi(
  params?: PaginationParams,
): Promise<ResponsApiPaginated<Notifikasi>> {
  return requestPaginated<Notifikasi>('/notifikasi', params);
}

export function getNotifikasi(
  id: ResourceId,
): Promise<ResponsApi<Notifikasi>> {
  return request<Notifikasi>(resourcePath('/notifikasi/', id));
}

export function markNotifikasiRead(
  id: ResourceId,
): Promise<ResponsApi<Notifikasi>> {
  return request<Notifikasi>(`${resourcePath('/notifikasi/', id)}/read`, 'PUT');
}

export function markAllNotifikasiRead(): Promise<ResponsApi<null>> {
  return request<null>('/notifikasi/read-all', 'PUT');
}

export function deleteNotifikasi(id: ResourceId): Promise<ResponsApi<null>> {
  return request<null>(resourcePath('/notifikasi/', id), 'DELETE');
}

export function listAdminNotifikasi(
  params?: PaginationParams,
): Promise<ResponsApiPaginated<Notifikasi>> {
  return requestPaginated<Notifikasi>('/admin/notifikasi', params);
}

export function getAdminNotifikasi(
  id: ResourceId,
): Promise<ResponsApi<Notifikasi>> {
  return request<Notifikasi>(resourcePath('/admin/notifikasi/', id));
}

export function markAdminNotifikasiRead(
  id: ResourceId,
): Promise<ResponsApi<Notifikasi>> {
  return request<Notifikasi>(
    `${resourcePath('/admin/notifikasi/', id)}/read`,
    'PUT',
  );
}

export function markAllAdminNotifikasiRead(): Promise<ResponsApi<null>> {
  return request<null>('/admin/notifikasi/read-all', 'PUT');
}

export function deleteAdminNotifikasi(
  id: ResourceId,
): Promise<ResponsApi<null>> {
  return request<null>(resourcePath('/admin/notifikasi/', id), 'DELETE');
}
