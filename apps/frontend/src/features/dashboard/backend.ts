"use client";

const DEFAULT_BACKEND_PORT = "3001";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getBackendUrl() {
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (envUrl) {
    return trimTrailingSlash(envUrl);
  }

  if (typeof window === "undefined") {
    return `http://localhost:${DEFAULT_BACKEND_PORT}`;
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const hostname = window.location.hostname || "localhost";
  return `${protocol}//${hostname}:${DEFAULT_BACKEND_PORT}`;
}

export function buildBackendUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getBackendUrl()}${normalizedPath}`;
}

export async function fetchBackendJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildBackendUrl(path), {
    cache: "no-store",
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Backend request failed (${response.status}) for ${path}`);
  }

  return response.json() as Promise<T>;
}

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function isAxisShareCoinType(coinType: string) {
  return coinType.toLowerCase().endsWith("::pusdc::pusdc");
}
