/**
 * Basic tests for schema validation
 */

import { describe, it, expect } from "bun:test";
import {
  string,
  number,
  boolean,
  object,
  array,
  union,
  email,
} from "../src/index.js";

describe("Primitive schemas", () => {
  it("should validate strings", () => {
    const schema = string();
    expect(schema.parse("hello")).toEqual({ success: true, data: "hello" });
    expect(schema.parse(123)).toEqual({
      success: false,
      error: expect.objectContaining({ code: "invalid_type" }),
    });
  });

  it("should validate numbers", () => {
    const schema = number();
    expect(schema.parse(42)).toEqual({ success: true, data: 42 });
    expect(schema.parse("42")).toEqual({
      success: false,
      error: expect.objectContaining({ code: "invalid_type" }),
    });
  });

  it("should validate booleans", () => {
    const schema = boolean();
    expect(schema.parse(true)).toEqual({ success: true, data: true });
    expect(schema.parse("true")).toEqual({
      success: false,
      error: expect.objectContaining({ code: "invalid_type" }),
    });
  });
});

describe("Composite schemas", () => {
  it("should validate objects", () => {
    const schema = object({
      name: string(),
      age: number(),
    });

    expect(schema.parse({ name: "John", age: 30 })).toEqual({
      success: true,
      data: { name: "John", age: 30 },
    });

    expect(schema.parse({ name: "John", age: "30" })).toEqual({
      success: false,
      error: expect.objectContaining({ code: "invalid_object" }),
    });
  });

  it("should validate arrays", () => {
    const schema = array(string());

    expect(schema.parse(["a", "b", "c"])).toEqual({
      success: true,
      data: ["a", "b", "c"],
    });

    expect(schema.parse([1, 2, 3])).toEqual({
      success: false,
      error: expect.objectContaining({ code: "invalid_array" }),
    });
  });

  it("should validate unions", () => {
    const schema = union([string(), number()]);

    expect(schema.parse("hello")).toEqual({ success: true, data: "hello" });
    expect(schema.parse(42)).toEqual({ success: true, data: 42 });
    expect(schema.parse(true)).toEqual({
      success: false,
      error: expect.objectContaining({ code: "invalid_union" }),
    });
  });
});

describe("Optional and nullable", () => {
  it("should handle optional values", () => {
    const schema = string().optional();

    expect(schema.parse("hello")).toEqual({ success: true, data: "hello" });
    expect(schema.parse(undefined)).toEqual({ success: true, data: undefined });
    expect(schema.parse(null)).toEqual({
      success: false,
      error: expect.objectContaining({ code: "invalid_type" }),
    });
  });

  it("should handle nullable values", () => {
    const schema = string().nullable();

    expect(schema.parse("hello")).toEqual({ success: true, data: "hello" });
    expect(schema.parse(null)).toEqual({ success: true, data: null });
    expect(schema.parse(undefined)).toEqual({
      success: false,
      error: expect.objectContaining({ code: "invalid_type" }),
    });
  });
});

describe("Validation utilities", () => {
  it("should validate email", () => {
    const schema = email();

    expect(schema.parse("test@example.com")).toEqual({
      success: true,
      data: "test@example.com",
    });

    expect(schema.parse("invalid")).toEqual({
      success: false,
      error: expect.objectContaining({ code: "custom" }),
    });
  });

  it("should validate min/max", () => {
    const schema = number().refine((n) => n >= 0, "Must be positive");

    expect(schema.parse(5)).toEqual({ success: true, data: 5 });
    expect(schema.parse(-1)).toEqual({
      success: false,
      error: expect.objectContaining({ code: "custom" }),
    });
  });
});
