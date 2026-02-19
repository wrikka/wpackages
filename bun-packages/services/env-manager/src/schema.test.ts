import { describe, expect, it } from "vitest";
import { formatValidationErrors, loadSchema, validateEnv } from "./utils/schema";

describe("schema validation", () => {
	it("should validate required fields", () => {
		const env = {
			PORT: "3000",
			NODE_ENV: "development",
		};
		const schema = {
			PORT: { type: "number" as const, required: true },
			NODE_ENV: { type: "string" as const, required: true },
			API_KEY: { type: "string" as const, required: true },
		};

		const result = validateEnv(env, schema);

		expect(result.valid).toBe(false);
		expect(result.errors).toHaveLength(1);
		expect(result.errors[0].key).toBe("API_KEY");
		expect(result.errors[0].type).toBe("missing");
	});

	it("should validate type constraints", () => {
		const env = {
			PORT: "not-a-number",
			ENABLED: "maybe",
		};
		const schema = {
			PORT: { type: "number" as const, required: true },
			ENABLED: { type: "boolean" as const, required: true },
		};

		const result = validateEnv(env, schema);

		expect(result.valid).toBe(false);
		expect(result.errors).toHaveLength(2);
	});

	it("should validate pattern constraints", () => {
		const env = {
			EMAIL: "invalid-email",
		};
		const schema = {
			EMAIL: { type: "email" as const, required: true },
		};

		const result = validateEnv(env, schema);

		expect(result.valid).toBe(false);
		expect(result.errors[0].type).toBe("type");
	});

	it("should validate choices constraints", () => {
		const env = {
			ENVIRONMENT: "staging",
		};
		const schema = {
			ENVIRONMENT: {
				type: "string" as const,
				required: true,
				choices: ["development", "production"] as const,
			},
		};

		const result = validateEnv(env, schema);

		expect(result.valid).toBe(false);
		expect(result.errors[0].type).toBe("choices");
	});

	it("should pass validation with valid data", () => {
		const env = {
			PORT: "3000",
			ENABLED: "true",
			ENVIRONMENT: "production",
		};
		const schema = {
			PORT: { type: "number" as const, required: true },
			ENABLED: { type: "boolean" as const, required: true },
			ENVIRONMENT: {
				type: "string" as const,
				required: true,
				choices: ["development", "production"] as const,
			},
		};

		const result = validateEnv(env, schema);

		expect(result.valid).toBe(true);
		expect(result.errors).toHaveLength(0);
	});

	it("should format validation errors correctly", () => {
		const result = {
			valid: false,
			errors: [
				{ key: "API_KEY", message: "Required environment variable 'API_KEY' is not set", type: "missing" as const },
				{ key: "PORT", message: "Invalid type for 'PORT': expected number, got string", type: "type" as const },
			],
		};

		const formatted = formatValidationErrors(result);

		expect(formatted).toContain("✗ Validation errors:");
		expect(formatted).toContain("API_KEY: Required environment variable 'API_KEY' is not set");
		expect(formatted).toContain("PORT: Invalid type for 'PORT': expected number, got string");
	});

	it("should format success message correctly", () => {
		const result = {
			valid: true,
			errors: [],
		};

		const formatted = formatValidationErrors(result);

		expect(formatted).toBe("✓ All environment variables are valid");
	});
});

describe("loadSchema", () => {
	it("should load JSON schema file", () => {
		const schemaPath = "./test-schema.json";
		const schema = loadSchema(schemaPath);

		if (schema._tag === "SchemaLoadError") {
			expect(schema._tag).toBe("SchemaLoadError");
		} else {
			expect(schema).toBeDefined();
		}
	});

	it("should return error for non-existent file", () => {
		const schemaPath = "./non-existent-schema.json";
		const schema = loadSchema(schemaPath);

		expect(schema._tag).toBe("SchemaLoadError");
		expect(schema.message).toContain("Failed to load schema");
	});
});
