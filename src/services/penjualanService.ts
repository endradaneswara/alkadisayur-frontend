import { request, requestPaginated } from './api';
import {
  buildQuery,
  resourcePath,
  type RentangTanggal,
  type ResourceId,
} from './apiHelpers';
import type {
  Penjualan,
  ResponsApi,
  ResponsApiPaginated,
  RingkasanPenjualan,
} from '@/types';

export interface PenjualanFilterParams extends RentangTanggal {
  lokasi_id?: number | null;
}

export function listPenjualanAdmin(
  params?: PenjualanFilterParams,
): Promise<ResponsApiPaginated<Penjualan>> {
  return requestPaginated<Penjualan>('/admin/penjualan', params);
}

export function getRingkasanPenjualanAdmin(
  params?: PenjualanFilterParams,
): Promise<ResponsApi<RingkasanPenjualan>> {
  return request<RingkasanPenjualan>(
    `/admin/penjualan/summary${buildQuery(params)}`,
  );
}

export function getPenjualanAdmin(
  id: ResourceId,
): Promise<ResponsApi<Penjualan>> {
  return request<Penjualan>(resourcePath('/admin/penjualan/', id));
}

export function listPenjualanSuperAdmin(
  params?: PenjualanFilterParams,
): Promise<ResponsApiPaginated<Penjualan>> {
  return requestPaginated<Penjualan>('/penjualan', params);
}

export function getRingkasanPenjualanSuperAdmin(
  params?: PenjualanFilterParams,
): Promise<ResponsApi<RingkasanPenjualan>> {
  return request<RingkasanPenjualan>(
    `/penjualan/summary${buildQuery(params)}`,
  );
}

export function getPenjualanSuperAdmin(
  id: ResourceId,
): Promise<ResponsApi<Penjualan>> {
  return request<Penjualan>(resourcePath('/penjualan/', id));
}
