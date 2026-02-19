export function safeStringify(value: unknown): string {
  try {
    return typeof value === "string" ? value : JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function normalizeBaseUrl(baseUrl: string | undefined, defaultUrl: string): string {
  const raw = (baseUrl ?? defaultUrl).trim();
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}

export function validateApiKey(apiKey: string | undefined, serviceName: string): string {
  const key = apiKey?.trim();
  if (!key) {
    throw new Error(`${serviceName} API key is required.`);
  }
  return key;
}

export function validateRequired<T>(value: T | undefined, name: string): T {
  if (value === undefined || value === null || value === "") {
    throw new Error(`${name} is required.`);
  }
  return value;
}
