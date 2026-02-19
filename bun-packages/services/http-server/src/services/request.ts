import type { H3Event } from "../types";

export interface RequestInfo {
  ip: string;
  userAgent: string;
  method: string;
  url: string;
  path: string;
  query: Record<string, string>;
  headers: Record<string, string>;
  cookies: Record<string, string>;
}

export function getRequestInfo(event: H3Event): RequestInfo {
  const url = new URL(event.request.url);
  const headers: Record<string, string> = {};
  const cookies: Record<string, string> = {};
  
  // Extract headers
  event.request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  
  // Extract cookies
  const cookieHeader = event.request.headers.get("cookie");
  if (cookieHeader) {
    cookieHeader.split(";").forEach(cookie => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) {
        cookies[key] = value;
      }
    });
  }
  
  // Extract query parameters
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  
  return {
    ip: headers["x-forwarded-for"] || 
        headers["x-real-ip"] || 
        headers["cf-connecting-ip"] || 
        "127.0.0.1",
    userAgent: headers["user-agent"] || "Unknown",
    method: event.request.method,
    url: event.request.url,
    path: url.pathname,
    query,
    headers,
    cookies,
  };
}

export function isJsonRequest(event: H3Event): boolean {
  const contentType = event.request.headers.get("content-type");
  return contentType?.includes("application/json") || false;
}

export function isFormRequest(event: H3Event): boolean {
  const contentType = event.request.headers.get("content-type");
  return contentType?.includes("application/x-www-form-urlencoded") || false;
}

export function isMultipartRequest(event: H3Event): boolean {
  const contentType = event.request.headers.get("content-type");
  return contentType?.includes("multipart/form-data") || false;
}

export function getClientIp(event: H3Event): string {
  return getRequestInfo(event).ip;
}

export function getUserAgent(event: H3Event): string {
  return getRequestInfo(event).userAgent;
}

export function getContentType(event: H3Event): string | undefined {
  return event.request.headers.get("content-type") || undefined;
}

export function getContentLength(event: H3Event): number {
  const length = event.request.headers.get("content-length");
  return length ? parseInt(length, 10) : 0;
}

export function isSecureRequest(event: H3Event): boolean {
  const url = new URL(event.request.url);
  return url.protocol === "https:" || url.protocol === "wss:";
}
