import { request, requestFile } from './api';
import { formDataFromFile } from './apiHelpers';
import type { ResponsApi } from '@/types';

export function previewImportBarang(file: File): Promise<ResponsApi<unknown>> {
  return request<unknown>('/data/import', 'POST', formDataFromFile(file));
}

export function confirmImportBarang(
  file: File,
  previewHash: string,
): Promise<ResponsApi<unknown>> {
  return request<unknown>(
    '/data/import',
    'POST',
    formDataFromFile(file, { confirmed: 'true', preview_hash: previewHash }),
  );
}

export function exportBarang(): Promise<Blob> {
  return requestFile('/data/export');
}

export function downloadTemplateBarang(): Promise<Blob> {
  return requestFile('/data/template');
}
