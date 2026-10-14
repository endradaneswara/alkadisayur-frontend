import { request, requestPaginated } from './api';
import { resourcePath, type RentangTanggal, type ResourceId } from './apiHelpers';
import type {
  Penjualan,
  ResponsApi,
  ResponsApiPaginated,
  RingkasanPenjualan,
} from '@/types';

export function listPenjualanAdmin(
  params?: RentangTanggal,
): Promise<ResponsApiPaginated<Penjualan>> {
  return requestPaginated<Penjualan>('/admin/penjualan', params);
}

export function getRingkasanPenjualanAdmin(): Promise<
  ResponsApi<RingkasanPenjualan>
> {
  return request<RingkasanPenjualan>('/admin/penjualan/summary');
}

export function getPenjualanAdmin(
  id: ResourceId,
): Promise<ResponsApi<Penjualan>> {
  return request<Penjualan>(resourcePath('/admin/penjualan/', id));
}

export function listPenjualanSuperAdmin(
  params?: RentangTanggal,
): Promise<ResponsApiPaginated<Penjualan>> {
  return requestPaginated<Penjualan>('/penjualan', params);
}

export function getRingkasanPenjualanSuperAdmin(): Promise<
  ResponsApi<RingkasanPenjualan>
> {
  return request<RingkasanPenjualan>('/penjualan/summary');
}

export function getPenjualanSuperAdmin(
  id: ResourceId,
): Promise<ResponsApi<Penjualan>> {
  return request<Penjualan>(resourcePath('/penjualan/', id));
}
