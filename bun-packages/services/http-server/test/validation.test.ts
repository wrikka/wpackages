import { describe, it, expect } from "bun:test";
import {
  validateString,
  validateNumber,
  validateObject,
  createValidator,
  ValidationError,
  type ValidationRule
} from "../src/lib/validation";

describe("validation", () => {
  describe("validateString", () => {
    it("should validate valid string", () => {
      const rules: ValidationRule[] = [
        { field: "name", required: true, min: 2, max: 50 }
      ];

      const result = validateString("John Doe", rules);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.value).toBe("John Doe");
    });

    it("should reject empty string when required", () => {
      const rules: ValidationRule[] = [
        { field: "name", required: true }
      ];

      const result = validateString("", rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(["name is required"]);
    });

    it("should reject string that's too short", () => {
      const rules: ValidationRule[] = [
        { field: "name", min: 5 }
      ];

      const result = validateString("Jo", rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(["name must be at least 5 characters"]);
    });

    it("should reject string that's too long", () => {
      const rules: ValidationRule[] = [
        { field: "name", max: 10 }
      ];

      const result = validateString("Very Long Name", rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(["name must be at most 10 characters"]);
    });

    it("should validate with pattern", () => {
      const rules: ValidationRule[] = [
        { field: "email", pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      ];

      const result = validateString("test@example.com", rules);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should validate with custom rule", () => {
      const rules: ValidationRule[] = [
        {
          field: "password",
          custom: (value: string) => value.length >= 8 && /[A-Z]/.test(value)
        }
      ];

      const result = validateString("Password123", rules);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe("validateNumber", () => {
    it("should validate valid number", () => {
      const rules: ValidationRule[] = [
        { field: "age", required: true, min: 0, max: 120 }
      ];

      const result = validateNumber(25, rules);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.value).toBe(25);
    });

    it("should reject number that's too small", () => {
      const rules: ValidationRule[] = [
        { field: "age", min: 18 }
      ];

      const result = validateNumber(16, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(["age must be at least 18"]);
    });

    it("should reject number that's too large", () => {
      const rules: ValidationRule[] = [
        { field: "age", max: 65 }
      ];

      const result = validateNumber(70, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(["age must be at most 65"]);
    });
  });

  describe("validateObject", () => {
    it("should validate valid object", () => {
      const rules: ValidationRule[] = [
        { field: "user", required: true }
      ];

      const result = validateObject({ name: "John", age: 30 }, rules);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it("should reject empty object when required", () => {
      const rules: ValidationRule[] = [
        { field: "user", required: true }
      ];

      const result = validateObject({}, rules);

      expect(result.valid).toBe(false);
      expect(result.errors).toEqual(["user is required"]);
    });
  });

  describe("createValidator", () => {
    it("should create validator function", () => {
      const validator = createValidator([
        { field: "email", required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }
      ]);

      expect(typeof validator).toBe("function");

      const validResult = validator("test@example.com");
      expect(validResult.valid).toBe(true);

      const invalidResult = validator("invalid-email");
      expect(invalidResult.valid).toBe(false);
      expect(invalidResult.errors).toContain("email format is invalid");
    });
  });

  describe("ValidationError", () => {
    it("should create validation error", () => {
      const error = new ValidationError("Invalid input", ["Field1 error", "Field2 error"], "email");

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe("Invalid input");
      expect(error.errors).toEqual(["Field1 error", "Field2 error"]);
      expect(error.field).toBe("email");
      expect(error.name).toBe("ValidationError");
    });
  });
});
