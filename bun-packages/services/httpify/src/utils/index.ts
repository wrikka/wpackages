import type { H3Event, CookieOptions } from "../types";

export function getCookie(event: H3Event, name: string): string | undefined {
  const cookieHeader = event.request.headers.get("cookie");
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split(";").reduce((acc: Record<string, string>, cookie: string) => {
    const parts = cookie.trim().split("=");
    if (parts.length === 2) {
      const key = parts[0];
      const value = parts[1];
      if (key && value !== undefined) {
        acc[key] = value;
      }
    }
    return acc;
  }, {} as Record<string, string>);

  return cookies[name];
}

export function setCookie(event: H3Event, name: string, value: string, options: CookieOptions = {}): void {
  let cookie = `${name}=${value}`;

  if (options.maxAge) {
    cookie += `; Max-Age=${options.maxAge}`;
  }

  if (options.expires) {
    cookie += `; Expires=${options.expires.toUTCString()}`;
  }

  if (options.domain) {
    cookie += `; Domain=${options.domain}`;
  }

  if (options.path) {
    cookie += `; Path=${options.path}`;
  }

  if (options.secure) {
    cookie += "; Secure";
  }

  if (options.httpOnly) {
    cookie += "; HttpOnly";
  }

  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }

  if (!event.response.headers) {
    event.response.headers = {};
  }
  event.response.headers['Set-Cookie'] = cookie;
}

export function deleteCookie(event: H3Event, name: string, options: {
  domain?: string;
  path?: string;
} = {}): void {
  setCookie(event, name, "", {
    ...options,
    maxAge: 0,
    expires: new Date(0),
  });
}

export function getHeader(event: H3Event, name: string): string | undefined {
  return event.request.headers.get(name) || undefined;
}

export function getHeaders(event: H3Event): Record<string, string> {
  const headers: Record<string, string> = {};
  event.request.headers.forEach((value: string, key: string) => {
    headers[key] = value;
  });
  return headers;
}

export function isMethod(event: H3Event, method: string): boolean {
  return event.request.method.toUpperCase() === method.toUpperCase();
}

export function getMethod(event: H3Event): string {
  return event.request.method.toUpperCase();
}

export function getURL(event: H3Event): URL {
  return new URL(event.request.url);
}

export function getPath(event: H3Event): string {
  return getURL(event).pathname;
}
