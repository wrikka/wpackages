/**
 * Composite schemas for complex types
 */

import { createSchema } from "../core/schema";
import type { Result, Schema } from "../../types/core";

// Object schema
export function object<T extends Record<string, Schema<any>>>(
  shape: T
): Schema<{ [K in keyof T]: T[K] extends Schema<infer U> ? U : never }> {
  return createSchema(
    "object",
    (value): Result<{ [K in keyof T]: T[K] extends Schema<infer U> ? U : never }> => {
      if (typeof value !== "object" || value === null) {
        return {
          success: false,
          error: {
            path: [],
            message: `Expected object, got ${typeof value}`,
            code: "invalid_type",
          },
        };
      }

      const result: Record<string, unknown> = {};
      const errors: Array<{ path: string[]; message: string; code: string }> = [];

      for (const [key, schema] of Object.entries(shape)) {
        const fieldResult = schema.safeParse((value as Record<string, unknown>)[key]);

        if (!fieldResult.success) {
          errors.push(
            ...fieldResult.error.issues?.map((issue) => ({
              ...issue,
              path: [key, ...issue.path],
            })) || [
              {
                path: [key],
                message: fieldResult.error.message,
                code: fieldResult.error.code,
              },
            ]
          );
        } else {
          result[key] = fieldResult.data;
        }
      }

      if (errors.length > 0) {
        return {
          success: false,
          error: {
            path: [],
            message: "Object validation failed",
            code: "invalid_object",
            issues: errors,
          },
        };
      }

      return { success: true, data: result as any };
    }
  );
}

// Array schema
export function array<T>(itemSchema: Schema<T>): Schema<T[]> {
  return createSchema("array", (value): Result<T[]> => {
    if (!Array.isArray(value)) {
      return {
        success: false,
        error: {
          path: [],
          message: `Expected array, got ${typeof value}`,
          code: "invalid_type",
        },
      };
    }

    const result: T[] = [];
    const errors: Array<{ path: string[]; message: string; code: string }> = [];

    for (let i = 0; i < value.length; i++) {
      const itemResult = itemSchema.safeParse(value[i]);

      if (!itemResult.success) {
        errors.push(
          ...itemResult.error.issues?.map((issue) => ({
            ...issue,
            path: [String(i), ...issue.path],
          })) || [
            {
              path: [String(i)],
              message: itemResult.error.message,
              code: itemResult.error.code,
            },
          ]
        );
      } else {
        result.push(itemResult.data);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: {
          path: [],
          message: "Array validation failed",
          code: "invalid_array",
          issues: errors,
        },
      };
    }

    return { success: true, data: result };
  });
}

// Union schema
export function union<T extends readonly [Schema<any>, ...Schema<any>[]]>(
  schemas: T
): Schema<T[number] extends Schema<infer U> ? U : never> {
  return createSchema("union", (value): Result<T[number] extends Schema<infer U> ? U : never> => {
    const errors: Array<{ path: string[]; message: string; code: string }> = [];

    for (const schema of schemas) {
      const result = schema.safeParse(value);
      if (result.success) {
        return result;
      }
      errors.push({
        path: [],
        message: result.error.message,
        code: result.error.code,
      });
    }

    return {
      success: false,
      error: {
        path: [],
        message: `Union validation failed: ${errors.map((e) => e.message).join(", ")}`,
        code: "invalid_union",
        issues: errors,
      },
    };
  });
}

// Intersection schema
export function intersection<A, B>(
  schemaA: Schema<A>,
  schemaB: Schema<B>
): Schema<A & B> {
  return createSchema("intersection", (value): Result<A & B> => {
    const resultA = schemaA.safeParse(value);
    if (!resultA.success) {
      return resultA;
    }

    const resultB = schemaB.safeParse(value);
    if (!resultB.success) {
      return resultB;
    }

    return { success: true, data: { ...resultA.data, ...resultB.data } as A & B };
  });
}

// Tuple schema
export function tuple<T extends readonly Schema<any>[]>(schemas: T): Schema<
  { [K in keyof T]: T[K] extends Schema<infer U> ? U : never }
> {
  return createSchema("tuple", (value): Result<{ [K in keyof T]: T[K] extends Schema<infer U> ? U : never }> => {
    if (!Array.isArray(value)) {
      return {
        success: false,
        error: {
          path: [],
          message: `Expected array, got ${typeof value}`,
          code: "invalid_type",
        },
      };
    }

    if (value.length !== schemas.length) {
      return {
        success: false,
        error: {
          path: [],
          message: `Expected tuple of length ${schemas.length}, got ${value.length}`,
          code: "invalid_tuple",
        },
      };
    }

    const result: unknown[] = [];
    const errors: Array<{ path: string[]; message: string; code: string }> = [];

    for (let i = 0; i < schemas.length; i++) {
      const itemResult = schemas[i]?.safeParse(value[i]);

      if (!itemResult?.success) {
        errors.push(
          ...itemResult?.error.issues?.map((issue) => ({
            ...issue,
            path: [String(i), ...issue.path],
          })) || [
            {
              path: [String(i)],
              message: itemResult?.error?.message || "Invalid item",
              code: itemResult?.error?.code || "invalid_item",
            },
          ]
        );
      } else {
        result.push(itemResult.data);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: {
          path: [],
          message: "Tuple validation failed",
          code: "invalid_tuple",
          issues: errors,
        },
      };
    }

    return { success: true, data: result as any };
  });
}

// Record schema
export function record<T>(valueSchema: Schema<T>): Schema<Record<string, T>> {
  return createSchema("record", (value): Result<Record<string, T>> => {
    if (typeof value !== "object" || value === null) {
      return {
        success: false,
        error: {
          path: [],
          message: `Expected object, got ${typeof value}`,
          code: "invalid_type",
        },
      };
    }

    const result: Record<string, T> = {};
    const errors: Array<{ path: string[]; message: string; code: string }> = [];

    for (const [key, val] of Object.entries(value)) {
      const valResult = valueSchema.safeParse(val);

      if (!valResult.success) {
        errors.push(
          ...valResult.error.issues?.map((issue) => ({
            ...issue,
            path: [key, ...issue.path],
          })) || [
            {
              path: [key],
              message: valResult.error.message,
              code: valResult.error.code,
            },
          ]
        );
      } else {
        result[key] = valResult.data;
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: {
          path: [],
          message: "Record validation failed",
          code: "invalid_record",
          issues: errors,
        },
      };
    }

    return { success: true, data: result };
  });
}

// Enum schema
export function enum_<T extends Record<string, string | number>>(
  enumObj: T
): Schema<T[keyof T]> {
  const values = Object.values(enumObj);

  return createSchema("enum", (value): Result<T[keyof T]> => {
    if (!values.includes(value as any)) {
      return {
        success: false,
        error: {
          path: [],
          message: `Expected one of ${values.map((v) => JSON.stringify(v)).join(", ")}, got ${JSON.stringify(value)}`,
          code: "invalid_enum",
        },
      };
    }
    return { success: true, data: value as T[keyof T] };
  });
}
