import { and, eq } from 'drizzle-orm';
import { requireAuth, requireOrg, useDb } from '../composables';

export interface ApiContext {
  user: any;
  org: any;
  db: any;
}

export function createApiHandler<T = any>(
  handler: (context: ApiContext, event: any) => Promise<T>
) {
  return defineEventHandler(async (event) => {
    const user = requireAuth(event);
    const org = requireOrg(event);
    const db = useDb();

    return handler({ user, org, db }, event);
  });
}

export function withPagination<T>(items: T[], page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  const paginated = items.slice(offset, offset + limit);

  return {
    data: paginated,
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
}

export function createSuccessResponse<T>(data: T, message?: string) {
  return {
    success: true,
    data,
    ...(message && { message }),
  };
}

export function createErrorResponse(message: string, code = 400, details?: any) {
  return {
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
    },
  };
}

export async function getEntityById<T>(
  db: any,
  table: any,
  id: string,
  orgId?: string
): Promise<T | null> {
  const conditions = [eq(table.id, id)];
  if (orgId) {
    conditions.push(eq(table.organizationId, orgId));
  }

  return await db.query[table].findFirst({
    where: and(...conditions),
  });
}

export async function validateRequiredFields(
  body: any,
  fields: string[],
  fieldNames?: Record<string, string>
) {
  const missing = fields.filter(field => !body[field]);

  if (missing.length > 0) {
    const fieldLabels = missing.map(f => fieldNames?.[f] || f);
    throw createError({
      statusCode: 400,
      statusMessage: `Missing required fields: ${fieldLabels.join(', ')}`,
    });
  }
}

export function parseQueryParams<T extends Record<string, any>>(
  event: any,
  schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'array'>
): Partial<T> {
  const query = getQuery(event);
  const result: Partial<T> = {};

  for (const [key, type] of Object.entries(schema)) {
    const value = query[key];

    if (value === undefined) continue;

    switch (type) {
      case 'string':
        result[key as keyof T] = value as T[keyof T];
        break;
      case 'number':
        result[key as keyof T] = Number(value) as T[keyof T];
        break;
      case 'boolean':
        result[key as keyof T] = (value === 'true' || value === true) as T[keyof T];
        break;
      case 'array':
        result[key as keyof T] = (Array.isArray(value) ? value : [value]) as T[keyof T];
        break;
    }
  }

  return result;
}
