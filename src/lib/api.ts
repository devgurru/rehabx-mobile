import { API_URL } from './config';
import type { ApiErrorBody } from './types';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

let getToken: () => string | null = () => null;
let onUnauthorized: () => void = () => undefined;

/** Wired once from the Redux store so the HTTP layer stays framework-agnostic. */
export function configureApi(options: {
  getToken: () => string | null;
  onUnauthorized: () => void;
}) {
  getToken = options.getToken;
  onUnauthorized = options.onUnauthorized;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      `Can’t reach RehabX at ${API_URL}. Check your connection and that the server is running.`,
    );
  }

  const payload = (await response.json().catch(() => null)) as { data: T } | ApiErrorBody | null;
  if (!response.ok) {
    if (response.status === 401 && token) onUnauthorized();
    const message = payload && 'error' in payload ? payload.error.message : 'Something went wrong';
    throw new ApiError(response.status, message);
  }
  return (payload as { data: T }).data;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
};
