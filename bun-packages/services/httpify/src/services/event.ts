import type { H3Event, H3Response } from "../types";

export function defineEventHandler<T = any>(handler: (event: H3Event) => T | Promise<T>) {
  return handler;
}

export function getQuery(event: H3Event): Record<string, string> {
  const url = new URL(event.request.url);
  const query: Record<string, string> = {};
  
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });
  
  return query;
}

export function getRouterParam(event: H3Event, name: string): string | undefined {
  return event.context['params']?.[name];
}

export async function readBody<T = any>(event: H3Event): Promise<T> {
  const contentType = event.request.headers.get("content-type");
  
  if (contentType?.includes("application/json")) {
    return await event.request.json() as T;
  }
  
  if (contentType?.includes("application/x-www-form-urlencoded")) {
    const text = await event.request.text();
    const params = new URLSearchParams(text);
    const result: Record<string, any> = {};
    
    params.forEach((value, key) => {
      result[key] = value;
    });
    
    return result as T;
  }
  
  return await event.request.text() as T;
}

export function sendRedirect(_event: H3Event, location: string, status = 302): H3Response {
  return {
    status,
    headers: {
      "Location": location,
    },
  };
}

export function setResponseStatus(event: H3Event, status: number, statusText?: string): void {
  event.response.status = status;
  if (statusText) {
    event.response.statusText = statusText;
  }
}

export function setResponseHeader(event: H3Event, name: string, value: string): void {
  if (!event.response.headers) {
    event.response.headers = {};
  }
  event.response.headers[name] = value;
}

export function setResponseHeaders(event: H3Event, headers: Record<string, string>): void {
  if (!event.response.headers) {
    event.response.headers = {};
  }
  Object.assign(event.response.headers, headers);
}
