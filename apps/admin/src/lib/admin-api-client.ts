import { getAdminAccessToken } from "@/lib/admin-session";

type QueryPrimitive = string | number | boolean | null | undefined;

type RequestOptions = {
  signal?: AbortSignal;
  auth?: boolean;
};

const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_BASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  "http://localhost:3000/api/v1";

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function buildUrl(pathname: string, query?: Record<string, QueryPrimitive>): string {
  const url = new URL(`${normalizeBaseUrl(DEFAULT_API_BASE_URL)}${pathname}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === "" || value === null || value === undefined) {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function extractErrorMessage(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const payload = (await response.json()) as
        | {
            message?: string | string[];
            error?: { message?: string };
          }
        | undefined;

      if (Array.isArray(payload?.message) && payload.message.length) {
        return payload.message.join(", ");
      }

      if (typeof payload?.message === "string" && payload.message) {
        return payload.message;
      }

      if (typeof payload?.error?.message === "string" && payload.error.message) {
        return payload.error.message;
      }
    }

    const text = await response.text();
    return text || fallback;
  } catch {
    return fallback;
  }
}

function buildHeaders(options?: RequestOptions): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options?.auth !== false) {
    const token = getAdminAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

async function requestAdminJson<T>(
  method: string,
  pathname: string,
  body?: unknown,
  query?: Record<string, QueryPrimitive>,
  options?: RequestOptions,
): Promise<T> {
  const headers = buildHeaders(options) as Record<string, string>;

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(buildUrl(pathname, query), {
    method,
    cache: "no-store",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return (await response.json()) as T;
}

export async function getAdminJson<T>(
  pathname: string,
  query?: Record<string, QueryPrimitive>,
  options?: RequestOptions,
): Promise<T> {
  return requestAdminJson<T>("GET", pathname, undefined, query, options);
}

export async function postAdminJson<T>(
  pathname: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return requestAdminJson<T>("POST", pathname, body, undefined, options);
}

export async function patchAdminJson<T>(
  pathname: string,
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return requestAdminJson<T>("PATCH", pathname, body, undefined, options);
}
