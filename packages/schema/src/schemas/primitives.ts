/**
 * Primitive schemas for basic types
 */

import { createSchema } from "../core/schema.js";
import type { Result } from "../types/core.js";

// String schema
export function string(): Schema<string> {
  return createSchema("string", (value): Result<string> => {
    if (typeof value !== "string") {
      return {
        success: false,
        error: {
          path: [],
          message: `Expected string, got ${typeof value}`,
          code: "invalid_type",
        },
      };
    }
    return { success: true, data: value };
  });
}

// Number schema
export function number(): Schema<number> {
  return createSchema("number", (value): Result<number> => {
    if (typeof value !== "number") {
      return {
        success: false,
        error: {
          path: [],
          message: `Expected number, got ${typeof value}`,
          code: "invalid_type",
        },
      };
    }
    if (isNaN(value)) {
      return {
        success: false,
        error: {
          path: [],
          message: "Expected number, got NaN",
          code: "invalid_type",
        },
      };
    }
    return { success: true, data: value };
  });
}

// Boolean schema
export function boolean(): Schema<boolean> {
  return createSchema("boolean", (value): Result<boolean> => {
    if (typeof value !== "boolean") {
      return {
        success: false,
        error: {
          path: [],
          message: `Expected boolean, got ${typeof value}`,
          code: "invalid_type",
        },
      };
    }
    return { success: true, data: value };
  });
}

// Date schema
export function date(): Schema<Date> {
  return createSchema("date", (value): Result<Date> => {
    if (!(value instanceof Date)) {
      return {
        success: false,
        error: {
          path: [],
          message: `Expected Date, got ${typeof value}`,
          code: "invalid_type",
        },
      };
    }
    if (isNaN(value.getTime())) {
      return {
        success: false,
        error: {
          path: [],
          message: "Invalid date",
          code: "invalid_date",
        },
      };
    }
    return { success: true, data: value };
  });
}

// Literal schema
export function literal<T extends string | number | boolean>(value: T): Schema<T> {
  return createSchema("literal", (input): Result<T> => {
    if (input !== value) {
      return {
        success: false,
        error: {
          path: [],
          message: `Expected literal ${JSON.stringify(value)}, got ${JSON.stringify(input)}`,
          code: "invalid_literal",
        },
      };
    }
    return { success: true, data: input as T };
  });
}

// Any schema
export function any(): Schema<unknown> {
  return createSchema("any", (value): Result<unknown> => {
    return { success: true, data: value };
  });
}

// Unknown schema
export function unknown(): Schema<unknown> {
  return createSchema("unknown", (value): Result<unknown> => {
    return { success: true, data: value };
  });
}

// Never schema
export function never(): Schema<never> {
  return createSchema("never", (_value): Result<never> => {
    return {
      success: false,
      error: {
        path: [],
        message: "Expected never",
        code: "invalid_type",
      },
    };
  });
}
