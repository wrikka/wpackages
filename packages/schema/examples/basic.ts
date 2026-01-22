/**
 * Basic usage examples for @wpackages/schema
 */

import {
  string,
  number,
  boolean,
  object,
  array,
  union,
  email,
} from "../src/index.js";

// Composite schemas
const userSchema = object({
  name: string(),
  age: number(),
  email: email(),
  isActive: boolean(),
});

// Optional and nullable
const optionalStringSchema = string().optional();
const nullableStringSchema = string().nullable();

// Array schema
const tagsSchema = array(string());

// Union schema
const valueSchema = union([string(), number()]);

// Validation with refinements
const positiveNumberSchema = number().refine((n) => n > 0, "Must be positive");

// Transform
const uppercaseSchema = string().transform((s) => s.toUpperCase());

// Complex object
const complexSchema = object({
  users: array(
    object({
      name: string(),
      age: number(),
      email: email(),
    })
  ),
  tags: array(string()),
  metadata: object({
    created: string(),
    updated: string(),
  }),
});

// Usage examples
console.log("=== Basic Usage ===");

// Parse and validate
const result1 = userSchema.parse({
  name: "John Doe",
  age: 30,
  email: "john@example.com",
  isActive: true,
});

console.log("User validation result:", result1);

// Safe parse
const result2 = userSchema.safeParse({
  name: "John Doe",
  age: "30", // Invalid type
  email: "john@example.com",
  isActive: true,
});

console.log("Safe parse result:", result2);

// Optional values
const result3 = optionalStringSchema.parse(undefined);
console.log("Optional string result:", result3);

// Nullable values
const result4 = nullableStringSchema.parse(null);
console.log("Nullable string result:", result4);

// Array validation
const result5 = tagsSchema.parse(["tag1", "tag2", "tag3"]);
console.log("Array validation result:", result5);

// Union validation
const result6 = valueSchema.parse("hello");
console.log("Union validation result:", result6);

const result7 = valueSchema.parse(42);
console.log("Union validation result:", result7);

// Refinements
const result8 = positiveNumberSchema.parse(5);
console.log("Positive number result:", result8);

const result9 = positiveNumberSchema.parse(-5);
console.log("Positive number result:", result9);

// Transform
const result10 = uppercaseSchema.parse("hello");
console.log("Uppercase transform result:", result10);

// Complex object
const result11 = complexSchema.parse({
  users: [
    {
      name: "John Doe",
      age: 30,
      email: "john@example.com",
    },
  ],
  tags: ["tag1", "tag2"],
  metadata: {
    created: "2024-01-01",
    updated: "2024-01-02",
  },
});

console.log("Complex object result:", result11);
