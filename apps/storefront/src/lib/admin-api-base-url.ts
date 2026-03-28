function normalizeBaseUrl(value: string) {
  const trimmed = value.trim();
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

export function resolveApiBaseUrl() {
  if (typeof window !== "undefined") {
    return "";
  }

  if (process.env.API_BASE_URL) {
    return normalizeBaseUrl(process.env.API_BASE_URL);
  }

  return normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080");
}
