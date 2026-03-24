function normalizeBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export function resolveApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);
  }

  if (typeof window !== "undefined") {
    return "";
  }

  return normalizeBaseUrl(process.env.API_BASE_URL ?? "http://localhost:8080");
}
