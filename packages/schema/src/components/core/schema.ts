/**
 * Core Schema implementation with high-performance validation
 */

import type { Schema, Result } from "../../types/core";

export class BaseSchema<T> implements Schema<T> {
  private _type: string;
  private _parseFn: (value: unknown) => Result<T>;
  private _optional: boolean = false;
  private _nullable: boolean = false;
  private _transformFn?: (value: T) => any;
  private _refinements: Array<(value: T) => boolean | string> = [];
  private _message?: string;

  constructor(type: string, parseFn: (value: unknown) => Result<T>) {
    this._type = type;
    this._parseFn = parseFn;
  }

  parse(value: unknown): Result<T> {
    // Handle optional
    if (this._optional && value === undefined) {
      return { success: true, data: undefined as T };
    }

    // Handle nullable
    if (this._nullable && value === null) {
      return { success: true, data: null as T };
    }

    // Parse value
    const result = this._parseFn(value);

    if (!result.success) {
      return result;
    }

    let data = result.data;

    // Apply refinements
    for (const refinement of this._refinements) {
      const check = refinement(data);
      if (typeof check === "string") {
        return {
          success: false,
          error: {
            path: [],
            message: check,
            code: "custom",
          },
        };
      }
      if (!check) {
        return {
          success: false,
          error: {
            path: [],
            message: this._message || `Refinement failed`,
            code: "custom",
          },
        };
      }
    }

    // Apply transform
    if (this._transformFn) {
      data = this._transformFn(data);
    }

    return { success: true, data };
  }

  safeParse(value: unknown): Result<T> {
    try {
      return this.parse(value);
    } catch (error) {
      return {
        success: false,
        error: {
          path: [],
          message: error instanceof Error ? error.message : "Unknown error",
          code: "internal_error",
        },
      };
    }
  }

  optional(): Schema<T | undefined> {
    const schema = this.clone();
    schema._optional = true;
    return schema as Schema<T | undefined>;
  }

  nullable(): Schema<T | null> {
    const schema = this.clone();
    schema._nullable = true;
    return schema as Schema<T | null>;
  }

  transform<U>(fn: (value: T) => U): Schema<U> {
    const schema = this.clone();
    schema._transformFn = fn as (value: T) => any;
    return schema as unknown as Schema<U>;
  }

  refine(refinement: (value: T) => boolean | string): Schema<T> {
    const schema = this.clone();
    schema._refinements.push(refinement);
    return schema;
  }

  withMessage(message: string): Schema<T> {
    const schema = this.clone();
    schema._message = message;
    return schema;
  }

  private clone(): this {
    const clone = new BaseSchema(this._type, this._parseFn) as this;
    clone._optional = this._optional;
    clone._nullable = this._nullable;
    clone._transformFn = this._transformFn as (value: T) => any;
    clone._refinements = [...this._refinements];
    clone._message = this._message as string;
    return clone;
  }
}

export function createSchema<T>(
  type: string,
  parseFn: (value: unknown) => Result<T>
): Schema<T> {
  return new BaseSchema(type, parseFn);
}
