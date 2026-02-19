import type { H3Event } from 'h3';

export interface ApiError {
  statusCode: number;
  message: string;
  code?: string;
  details?: any;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function createApiError(
  statusCode: number,
  message: string,
  code?: string,
  details?: any
): ApiError {
  return new ApiError(statusCode, message, code, details);
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return createApiError(500, error.message, 'INTERNAL_ERROR');
  }

  return createApiError(500, 'An unexpected error occurred', 'UNKNOWN_ERROR');
}

export function withErrorHandler(handler: (event: H3Event) => Promise<any>) {
  return async (event: H3Event) => {
    try {
      return await handler(event);
    } catch (error) {
      const apiError = handleApiError(error);

      throw createError({
        statusCode: apiError.statusCode,
        statusMessage: apiError.message,
      });
    }
  };
}

export function validateRequestBody<T>(
  body: any,
  schema: Record<keyof T, 'required' | 'optional'>,
  customValidation?: (data: T) => string | null
): T {
  const errors: string[] = [];

  for (const [key, requirement] of Object.entries(schema)) {
    if (requirement === 'required' && body[key] === undefined) {
      errors.push(`${String(key)} is required`);
    }
  }

  if (customValidation) {
    const customError = customValidation(body as T);
    if (customError) {
      errors.push(customError);
    }
  }

  if (errors.length > 0) {
    throw createApiError(400, errors.join(', '), 'VALIDATION_ERROR');
  }

  return body as T;
}

export function withValidation<T>(
  schema: Record<keyof T, 'required' | 'optional'>,
  customValidation?: (data: T) => string | null
) {
  return (handler: (event: H3Event, data: T) => Promise<any>) => {
    return withErrorHandler(async (event: H3Event) => {
      const body = await readBody(event);
      const validatedData = validateRequestBody(body, schema, customValidation);
      return handler(event, validatedData);
    });
  };
}

export function requireAuth(event: H3Event) {
  const user = event.context.user;
  if (!user) {
    throw createApiError(401, 'Unauthorized', 'UNAUTHORIZED');
  }
  return user;
}

export function requireOrg(event: H3Event) {
  const org = event.context.org;
  if (!org) {
    throw createApiError(403, 'Organization not found', 'ORG_NOT_FOUND');
  }
  return org;
}

export function requirePermission(permission: string) {
  return (event: H3Event) => {
    const user = requireAuth(event);

    if (!user.permissions?.includes(permission)) {
      throw createApiError(403, 'Forbidden', 'INSUFFICIENT_PERMISSIONS');
    }

    return true;
  };
}

export function withRateLimit(
  limit: number,
  windowSeconds: number = 60
) {
  const requests = new Map<string, number[]>();

  return (event: H3Event) => {
    const userId = event.context.user?.id || event.context.ip;
    const now = Date.now();
    const windowStart = now - windowSeconds * 1000;

    const userRequests = requests.get(userId) || [];
    const recentRequests = userRequests.filter(time => time > windowStart);

    if (recentRequests.length >= limit) {
      throw createApiError(429, 'Too many requests', 'RATE_LIMIT_EXCEEDED');
    }

    recentRequests.push(now);
    requests.set(userId, recentRequests);
  };
}
