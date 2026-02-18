/**
 * HTTP Requests for wshell
 * Native http get/post/put/delete commands
 */
import type { ShellValue, RecordValue } from "../types/value.types";
import { record, str, int, list, binary } from "../types/value.types";

// HTTP options
export interface HTTPOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  headers?: Record<string, string>;
  body?: string | Uint8Array;
  timeout?: number;
  followRedirects?: boolean;
}

// HTTP response
export interface HTTPResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  url: string;
}

// Native HTTP commands
export async function httpGet(url: string, options: Omit<HTTPOptions, "method"> = {}): Promise<HTTPResponse> {
  return await httpRequest(url, { ...options, method: "GET" });
}

export async function httpPost(url: string, options: Omit<HTTPOptions, "method"> = {}): Promise<HTTPResponse> {
  return await httpRequest(url, { ...options, method: "POST" });
}

export async function httpPut(url: string, options: Omit<HTTPOptions, "method"> = {}): Promise<HTTPResponse> {
  return await httpRequest(url, { ...options, method: "PUT" });
}

export async function httpDelete(url: string, options: Omit<HTTPOptions, "method"> = {}): Promise<HTTPResponse> {
  return await httpRequest(url, { ...options, method: "DELETE" });
}

// Main HTTP request function
export async function httpRequest(url: string, options: HTTPOptions = {}): Promise<HTTPResponse> {
  const controller = new AbortController();
  const timeout = options.timeout || 30000;
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const fetchOptions: RequestInit = {
      method: options.method || "GET",
      headers: options.headers,
      body: options.body,
      signal: controller.signal,
      redirect: options.followRedirects !== false ? "follow" : "manual",
    };
    
    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);
    
    const body = await response.text();
    
    // Convert headers
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    
    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      body,
      url: response.url,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Convert HTTP response to ShellValue
export function responseToValue(response: HTTPResponse): ShellValue {
  const headers: Record<string, ShellValue> = {};
  for (const [key, value] of Object.entries(response.headers)) {
    headers[key] = str(value);
  }
  
  return record({
    status: { _tag: "Int", value: BigInt(response.status) } as const,
    statusText: str(response.statusText),
    headers: record(headers),
    body: str(response.body),
    url: str(response.url),
  });
}

// Parse JSON response
export function parseJSONResponse(response: HTTPResponse): ShellValue {
  try {
    const data = JSON.parse(response.body);
    return jsonToShellValue(data);
  } catch {
    return str(response.body);
  }
}

// Convert JSON to ShellValue
function jsonToShellValue(data: unknown): ShellValue {
  if (data === null) return { _tag: "Null" } as const;
  if (typeof data === "boolean") return { _tag: "Bool", value: data } as const;
  if (typeof data === "number") {
    if (Number.isInteger(data)) {
      return { _tag: "Int", value: BigInt(data) } as const;
    }
    return { _tag: "Float", value: data } as const;
  }
  if (typeof data === "string") return str(data);
  if (Array.isArray(data)) {
    return list(data.map(jsonToShellValue));
  }
  if (typeof data === "object") {
    const fields: Record<string, ShellValue> = {};
    for (const [key, value] of Object.entries(data)) {
      fields[key] = jsonToShellValue(value);
    }
    return record(fields);
  }
  return str(String(data));
}
