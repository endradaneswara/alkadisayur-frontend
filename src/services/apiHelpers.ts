export type QueryParams = object;
export type ResourceId = string | number;

export interface PaginationParams {
  page?: number;
}

export interface RentangTanggal extends PaginationParams {
  tanggal_mulai?: string;
  tanggal_selesai?: string;
}

export function buildQuery(params?: QueryParams): string {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

export function resourcePath(collection: string, id: ResourceId): string {
  return `${collection.replace(/\/+$/, '')}/${encodeURIComponent(String(id))}`;
}

export function formDataFromFile(
  file: File,
  fields: Record<string, string> = {},
): FormData {
  const formData = new FormData();
  formData.set('file', file);

  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }

  return formData;
}
