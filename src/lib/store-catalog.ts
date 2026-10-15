import { API_BASE_URL } from "@/services/api";

export function formatRupiah(value: string | number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function getProductImageUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const apiOrigin = API_BASE_URL.replace(/\/api\/?$/, "");
  if (path.startsWith("/storage/")) {
    return `${apiOrigin}${path}`;
  }
  if (path.startsWith("/")) {
    return path;
  }

  const storagePath = path.replace(/^storage\//, "");
  return `${apiOrigin}/storage/${storagePath}`;
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Terjadi kesalahan saat menghubungi toko.";
}
