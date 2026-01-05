import { API_BASE_URL, REQUEST_TIMEOUT_MS } from "./config";

export interface ApiRequestOptions<TBody = unknown> {
  path: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  token?: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

const buildUrl = (path: string): string => {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const parsePayload = (payload: string) => {
  if (!payload) {
    return null;
  }
  try {
    return JSON.parse(payload);
  } catch {
    return null;
  }
};

export const apiRequest = async <TResponse, TBody = unknown>(
  options: ApiRequestOptions<TBody>
): Promise<TResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  try {
    console.log(
      "[httpClient] request",
      options.method ?? "GET",
      buildUrl(options.path),
      {
        hasBody: Boolean(options.body),
        headers: Object.keys(headers),
      }
    );
    const response = await fetch(buildUrl(options.path), {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal ?? controller.signal,
    });
    const text = await response.text();
    console.log("[httpClient] response", response.status, response.url);
    const data = parsePayload(text);
    if (!response.ok) {
      const message =
        (data && typeof (data as Record<string, unknown>).detail === "string"
          ? (data as Record<string, string>).detail
          : "Error en la solicitud") ?? "Error en la solicitud";
      throw new ApiError(message, response.status, data);
    }
    return (data as TResponse) ?? ({} as TResponse);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if ((error as Error).name === "AbortError") {
      console.warn("[httpClient] timeout/abort", options.path);
      throw new ApiError("La solicitud tardó demasiado", 408);
    }
    console.error("[httpClient] unknown error", error);
    throw new ApiError(
      (error as Error).message ?? "No se pudo conectar con el servidor",
      500
    );
  } finally {
    clearTimeout(timeoutId);
  }
};
