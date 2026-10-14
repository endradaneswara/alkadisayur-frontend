import { ApiError, getValidationErrors, isRecord } from './apiError';
import { buildQuery, type QueryParams } from './apiHelpers';
import type {
  ResponsApi,
  ResponsApiPaginated,
} from '@/types';

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '');

const AUTH_TOKEN_KEY = 'alkadisayur_access_token';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
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
      typeof errorBody.message === 'string' ? errorBody.message : fallback,
    errors: getValidationErrors(errorBody.errors),
  };
}

export async function request<T>(
  path: string,
  method: ApiMethod = 'GET',
  body?: object | FormData,
): Promise<ResponsApi<T>> {
  const headers = new Headers({ Accept: 'application/json' });
  const token = getAuthToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let requestBody: BodyInit | undefined;

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });
  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
    }

    const error = getErrorMessage(
      responseBody,
      `Permintaan API gagal (${response.status}).`,
    );

    throw new ApiError(error.message, response.status, error.errors);
  }

  if (
    !isRecord(responseBody) ||
    typeof responseBody.success !== 'boolean' ||
    typeof responseBody.message !== 'string' ||
    !('data' in responseBody)
  ) {
    throw new ApiError('Respons API tidak memiliki format yang valid.', response.status);
  }

  return responseBody as unknown as ResponsApi<T>;
}

export async function requestPaginated<T>(
  path: string,
  params?: QueryParams,
): Promise<ResponsApiPaginated<T>> {
  const response = await request<T[]>(`${path}${buildQuery(params)}`);

  if (!('links' in response) || !('meta' in response)) {
    throw new ApiError('Respons API tidak berisi data pagination yang valid.', 200);
  }

  return response as ResponsApiPaginated<T>;
}

export async function requestFile(path: string): Promise<Blob> {
  const headers = new Headers();
  const token = getAuthToken();

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { headers });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
    }

    const error = getErrorMessage(
      await readResponseBody(response),
      `Unduhan gagal (${response.status}).`,
    );

    throw new ApiError(error.message, response.status, error.errors);
  }

  return response.blob();
}
