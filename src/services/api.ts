import { ApiError, getValidationErrors, isRecord } from "./apiError";
import { buildQuery, type QueryParams } from "./apiHelpers";
import type {
  ResponsApi,
  ResponsApiPaginated,
} from "@/types";

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"
).replace(/\/+$/, "");

const API_ORIGIN = new URL(API_BASE_URL).origin;
const AUTH_SESSION_HINT_KEY = "alkadisayur_authenticated";

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export function hasAuthSession(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(AUTH_SESSION_HINT_KEY) === "true";
}

export function setAuthSession(): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_SESSION_HINT_KEY, "true");
  }
}

export function clearAuthSession(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_SESSION_HINT_KEY);
  }
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch(`${API_ORIGIN}/sanctum/csrf-cookie`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new ApiError(
      `Gagal menyiapkan sesi aman (${response.status}).`,
      response.status,
    );
  }

  const xsrfCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("XSRF-TOKEN="));
  const encodedToken = xsrfCookie?.slice("XSRF-TOKEN=".length);

  if (!encodedToken) {
    throw new ApiError("Token perlindungan CSRF tidak tersedia.", 419);
  }

  return decodeURIComponent(encodedToken);
}

async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
}

function getErrorMessage(
  responseBody: unknown,
  fallback: string,
): { message: string; errors?: Record<string, string[]> } {
  const errorBody = isRecord(responseBody) ? responseBody : {};

  return {
    message:
      typeof errorBody.message === "string" ? errorBody.message : fallback,
    errors: getValidationErrors(errorBody.errors),
  };
}

export async function request<T>(
  path: string,
  method: ApiMethod = "GET",
  body?: object | FormData,
): Promise<ResponsApi<T>> {
  const headers = new Headers({ Accept: "application/json" });

  if (method !== "GET") {
    headers.set("X-XSRF-TOKEN", await getCsrfToken());
  }

  let requestBody: BodyInit | undefined;

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
    credentials: "include",
  });
  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }

    const error = getErrorMessage(
      responseBody,
      `Permintaan API gagal (${response.status}).`,
    );

    throw new ApiError(error.message, response.status, error.errors);
  }

  if (
    !isRecord(responseBody) ||
    typeof responseBody.success !== "boolean" ||
    typeof responseBody.message !== "string" ||
    !("data" in responseBody)
  ) {
    throw new ApiError(
      "Respons API tidak memiliki format yang valid.",
      response.status,
    );
  }

  return responseBody as unknown as ResponsApi<T>;
}

export async function requestPaginated<T>(
  path: string,
  params?: QueryParams,
): Promise<ResponsApiPaginated<T>> {
  const response = await request<T[]>(`${path}${buildQuery(params)}`);

  if (!("links" in response) || !("meta" in response)) {
    throw new ApiError(
      "Respons API tidak berisi data pagination yang valid.",
      200,
    );
  }

  return response as ResponsApiPaginated<T>;
}

export async function requestFile(path: string): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }

    const error = getErrorMessage(
      await readResponseBody(response),
      `Unduhan gagal (${response.status}).`,
    );

    throw new ApiError(error.message, response.status, error.errors);
  }

  return response.blob();
}
