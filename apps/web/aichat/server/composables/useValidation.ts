import { z } from 'zod';

export function validateBody<T>(schema: z.ZodSchema<T>, body: any): T {
  try {
    return schema.parse(body);
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: error,
    });
  }
}

export function validateQuery<T>(schema: z.ZodSchema<T>, query: any): T {
  try {
    return schema.parse(query);
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid query parameters',
      data: error,
    });
  }
}
