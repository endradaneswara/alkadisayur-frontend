import { request } from './api';
import { resourcePath, type ResourceId } from './apiHelpers';
import type { Keranjang, ResponsApi } from '@/types';

export function getKeranjang(): Promise<ResponsApi<Keranjang>> {
  return request<Keranjang>('/keranjang');
}

export function addItemKeranjang(
  barang_id: number,
  jumlah: number,
): Promise<ResponsApi<Keranjang>> {
  return request<Keranjang>('/keranjang/items', 'POST', { barang_id, jumlah });
}

export function updateItemKeranjang(
  id: ResourceId,
  jumlah: number,
): Promise<ResponsApi<Keranjang>> {
  return request<Keranjang>(resourcePath('/keranjang/items/', id), 'PUT', { jumlah });
}

export function removeItemKeranjang(
  id: ResourceId,
): Promise<ResponsApi<null>> {
  return request<null>(resourcePath('/keranjang/items/', id), 'DELETE');
}

export function clearKeranjang(): Promise<ResponsApi<null>> {
  return request<null>('/keranjang', 'DELETE');
}
