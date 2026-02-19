import { RetryableError, throwIfAborted, withRetry } from "@wai/ai-core";

export async function parseJsonOrThrow(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Invalid JSON response: ${message}`);
  }
}

export function shouldRetryStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

export async function* streamSse(res: Response, options?: { readonly signal?: AbortSignal }): AsyncIterable<string> {
  if (!res.body) {
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    throwIfAborted(options?.signal);
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const idx = buffer.indexOf("\n");
      if (idx === -1) break;
      const line = buffer.slice(0, idx).trimEnd();
      buffer = buffer.slice(idx + 1);

      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.startsWith("data:")) {
        const data = trimmed.slice("data:".length).trim();
        yield data;
      }
    }
  }
}

export async function* streamNdjson(res: Response, options?: { readonly signal?: AbortSignal }): AsyncIterable<string> {
  if (!res.body) {
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    throwIfAborted(options?.signal);
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const idx = buffer.indexOf("\n");
      if (idx === -1) break;
      const line = buffer.slice(0, idx).trimEnd();
      buffer = buffer.slice(idx + 1);

      const trimmed = line.trim();
      if (!trimmed) continue;

      yield trimmed;
    }
  }
}

export interface RetryOptions {
  readonly retries?: number;
  readonly signal?: AbortSignal;
  readonly isRetryable?: (err: unknown) => boolean;
}

export async function requestJsonWithRetry(
  url: string,
  init: RequestInit & { readonly signal?: AbortSignal },
  options: RetryOptions = {}
): Promise<unknown> {
  return withRetry(
    async () => {
      throwIfAborted(options.signal ?? init.signal);

      const res = await fetch(url, init);

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        const error = new Error(`Request failed (${res.status}): ${body || res.statusText}`);
        if (shouldRetryStatus(res.status)) {
          throw new RetryableError(error.message, error);
        }
        throw error;
      }

      return parseJsonOrThrow(res);
    },
    {
      retries: options.retries ?? 2,
      signal: options.signal ?? init.signal,
      isRetryable: options.isRetryable ?? ((err) => err instanceof RetryableError)
    }
  );
}
