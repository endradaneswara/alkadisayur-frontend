import { request, requestFile } from './api';
import { formDataFromFile } from './apiHelpers';
import type { ResponsApi } from '@/types';

export interface StockChangeItem {
  KodeItem: string;
  NamaItem: string;
  from: number;
  to: number;
}

export interface ImportErrorItem {
  row: number;
  field: string;
  message: string;
}

export interface ImportPreviewResult {
  valid: boolean;
  requires_confirmation?: boolean;
  stock_will_be_set_from_file?: boolean;
  blank_optional_cells_are_cleared?: boolean;
  created: number;
  updated: number;
  unchanged: number;
  stock_changes?: StockChangeItem[];
  errors?: ImportErrorItem[];
  preview_hash?: string | null;
}

export function previewImportBarang(file: File): Promise<ResponsApi<ImportPreviewResult>> {
  return request<ImportPreviewResult>('/data/import', 'POST', formDataFromFile(file));
}

export function confirmImportBarang(
  file: File,
  previewHash: string,
): Promise<ResponsApi<ImportPreviewResult>> {
  return request<ImportPreviewResult>(
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
