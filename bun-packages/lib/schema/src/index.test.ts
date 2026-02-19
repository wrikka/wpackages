import { describe, expect, it } from "vitest";
import s, {
	ArraySchema,
	BooleanSchema,
	EnumSchema,
	type Infer,
	LiteralSchema,
	NeverSchema,
	NumberSchema,
	ObjectSchema,
	SchemaParseError,
	StringSchema,
	UnionSchema,
} from "./index";

describe("Schema Library", () => {
	describe("StringSchema", () => {
		it("should parse valid strings", () => {
			const schema = s.string();
			expect(schema.parse("hello")).toBe("hello");
		});

		it("should reject non-strings", () => {
			const schema = s.string();
			const result = schema.safeParse(123);
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors[0].code).toBe("invalid_type");
			}
		});

		it("should validate min length", () => {
			const schema = s.string().min(3);
			expect(schema.parse("hello")).toBe("hello");
			const result = schema.safeParse("hi");
			expect(result.success).toBe(false);
		});

		it("should validate max length", () => {
			const schema = s.string().max(5);
			expect(schema.parse("hello")).toBe("hello");
			const result = schema.safeParse("hello world");
			expect(result.success).toBe(false);
		});

		it("should validate exact length", () => {
			const schema = s.string().length(5);
			expect(schema.parse("hello")).toBe("hello");
			const result = schema.safeParse("hi");
			expect(result.success).toBe(false);
		});

		it("should validate email", () => {
			const schema = s.string().email();
			expect(schema.parse("test@example.com")).toBe("test@example.com");
			const result = schema.safeParse("invalid-email");
			expect(result.success).toBe(false);
		});

		it("should validate URL", () => {
			const schema = s.string().url();
			expect(schema.parse("https://example.com")).toBe("https://example.com");
			const result = schema.safeParse("not-a-url");
			expect(result.success).toBe(false);
		});

		it("should validate UUID", () => {
			const schema = s.string().uuid();
			expect(schema.parse("550e8400-e29b-41d4-a716-446655440000")).toBe("550e8400-e29b-41d4-a716-446655440000");
			const result = schema.safeParse("not-a-uuid");
			expect(result.success).toBe(false);
		});

		it("should validate regex", () => {
			const schema = s.string().regex(/^[a-z]+$/);
			expect(schema.parse("hello")).toBe("hello");
			const result = schema.safeParse("HELLO");
			expect(result.success).toBe(false);
		});

		it("should trim strings", () => {
			const schema = s.string().trim();
			expect(schema.parse("  hello  ")).toBe("hello");
		});

		it("should convert to lowercase", () => {
			const schema = s.string().lowercase();
			expect(schema.parse("HELLO")).toBe("hello");
		});

		it("should convert to uppercase", () => {
			const schema = s.string().uppercase();
			expect(schema.parse("hello")).toBe("HELLO");
		});

		it("should support optional", () => {
			const schema = s.string().optional();
			expect(schema.parse("hello")).toBe("hello");
			expect(schema.parse(undefined)).toBe(undefined);
		});

		it("should support nullable", () => {
			const schema = s.string().nullable();
			expect(schema.parse("hello")).toBe("hello");
			expect(schema.parse(null)).toBe(null);
		});

		it("should support nullish", () => {
			const schema = s.string().nullish();
			expect(schema.parse("hello")).toBe("hello");
			expect(schema.parse(null)).toBe(null);
			expect(schema.parse(undefined)).toBe(undefined);
		});

		it("should support default values", () => {
			const schema = s.string().default("default");
			expect(schema.parse("hello")).toBe("hello");
			expect(schema.parse(undefined)).toBe("default");
		});

		it("should support lazy default values", () => {
			const schema = s.string().default(() => "lazy-default");
			expect(schema.parse(undefined)).toBe("lazy-default");
		});
	});

	describe("NumberSchema", () => {
		it("should parse valid numbers", () => {
			const schema = s.number();
			expect(schema.parse(42)).toBe(42);
		});

		it("should reject non-numbers", () => {
			const schema = s.number();
			const result = schema.safeParse("42");
			expect(result.success).toBe(false);
		});

		it("should validate min value", () => {
			const schema = s.number().min(10);
			expect(schema.parse(15)).toBe(15);
			const result = schema.safeParse(5);
			expect(result.success).toBe(false);
		});

		it("should validate max value", () => {
			const schema = s.number().max(10);
			expect(schema.parse(5)).toBe(5);
			const result = schema.safeParse(15);
			expect(result.success).toBe(false);
		});

		it("should validate integer", () => {
			const schema = s.number().int();
			expect(schema.parse(42)).toBe(42);
			const result = schema.safeParse(42.5);
			expect(result.success).toBe(false);
		});

		it("should validate positive", () => {
			const schema = s.number().positive();
			expect(schema.parse(42)).toBe(42);
			const result = schema.safeParse(-1);
			expect(result.success).toBe(false);
		});

		it("should validate negative", () => {
			const schema = s.number().negative();
			expect(schema.parse(-42)).toBe(-42);
			const result = schema.safeParse(1);
			expect(result.success).toBe(false);
		});

		it("should validate finite", () => {
			const schema = s.number().finite();
			expect(schema.parse(42)).toBe(42);
			const result1 = schema.safeParse(Infinity);
			const result2 = schema.safeParse(NaN);
			expect(result1.success).toBe(false);
			expect(result2.success).toBe(false);
		});

		it("should validate multipleOf", () => {
			const schema = s.number().multipleOf(5);
			expect(schema.parse(15)).toBe(15);
			const result = schema.safeParse(7);
			expect(result.success).toBe(false);
		});

		it("should support optional", () => {
			const schema = s.number().optional();
			expect(schema.parse(42)).toBe(42);
			expect(schema.parse(undefined)).toBe(undefined);
		});

		it("should support nullable", () => {
			const schema = s.number().nullable();
			expect(schema.parse(42)).toBe(42);
			expect(schema.parse(null)).toBe(null);
		});
	});

	describe("BooleanSchema", () => {
		it("should parse valid booleans", () => {
			const schema = s.boolean();
			expect(schema.parse(true)).toBe(true);
			expect(schema.parse(false)).toBe(false);
		});

		it("should reject non-booleans", () => {
			const schema = s.boolean();
			const result = schema.safeParse("true");
			expect(result.success).toBe(false);
		});

		it("should support optional", () => {
			const schema = s.boolean().optional();
			expect(schema.parse(true)).toBe(true);
			expect(schema.parse(undefined)).toBe(undefined);
		});
	});

	describe("ObjectSchema", () => {
		it("should parse valid objects", () => {
			const schema = s.object({
				name: s.string(),
				age: s.number(),
			});
			const result = schema.parse({ name: "John", age: 30 });
			expect(result).toEqual({ name: "John", age: 30 });
		});

		it("should reject invalid objects", () => {
			const schema = s.object({
				name: s.string(),
				age: s.number(),
			});
			const result = schema.safeParse({ name: 123, age: "30" });
			expect(result.success).toBe(false);
		});

		it("should reject extra keys", () => {
			const schema = s.object({
				name: s.string(),
			});
			const result = schema.safeParse({ name: "John", extra: "value" });
			expect(result.success).toBe(false);
		});

		it("should support nested objects", () => {
			const schema = s.object({
				user: s.object({
					name: s.string(),
					email: s.string().email(),
				}),
			});
			const result = schema.parse({
				user: { name: "John", email: "john@example.com" },
			});
			expect(result).toEqual({
				user: { name: "John", email: "john@example.com" },
			});
		});

		it("should support pick", () => {
			const schema = s.object({
				name: s.string(),
				age: s.number(),
				email: s.string(),
			});
			const picked = schema.pick(["name", "email"]);
			const result = picked.parse({ name: "John", email: "john@example.com" });
			expect(result).toEqual({ name: "John", email: "john@example.com" });
		});

		it("should support omit", () => {
			const schema = s.object({
				name: s.string(),
				age: s.number(),
				email: s.string(),
			});
			const omitted = schema.omit(["age"]);
			const result = omitted.parse({ name: "John", email: "john@example.com" });
			expect(result).toEqual({ name: "John", email: "john@example.com" });
		});

		it("should support extend", () => {
			const schema = s.object({
				name: s.string(),
			});
			const extended = schema.extend({
				age: s.number(),
			});
			const result = extended.parse({ name: "John", age: 30 });
			expect(result).toEqual({ name: "John", age: 30 });
		});

		it("should support merge", () => {
			const schema1 = s.object({ name: s.string() });
			const schema2 = s.object({ age: s.number() });
			const merged = schema1.merge(schema2);
			const result = merged.parse({ name: "John", age: 30 });
			expect(result).toEqual({ name: "John", age: 30 });
		});

		it("should support partial", () => {
			const schema = s.object({
				name: s.string(),
				age: s.number(),
			});
			const partial = schema.partial();
			const result = partial.parse({ name: "John" });
			expect(result).toEqual({ name: "John" });
		});

		it("should support optional fields", () => {
			const schema = s.object({
				name: s.string(),
				age: s.number().optional(),
			});
			const result = schema.parse({ name: "John" });
			expect(result).toEqual({ name: "John" });
		});

		it("should support default values", () => {
			const schema = s.object({
				name: s.string(),
				count: s.number().default(0),
			});
			const result = schema.parse({ name: "John" });
			expect(result).toEqual({ name: "John", count: 0 });
		});
	});

	describe("ArraySchema", () => {
		it("should parse valid arrays", () => {
			const schema = s.array(s.string());
			expect(schema.parse(["a", "b", "c"])).toEqual(["a", "b", "c"]);
		});

		it("should reject non-arrays", () => {
			const schema = s.array(s.string());
			const result = schema.safeParse("not-an-array");
			expect(result.success).toBe(false);
		});

		it("should validate array items", () => {
			const schema = s.array(s.number());
			const result = schema.safeParse([1, 2, "three"]);
			expect(result.success).toBe(false);
		});

		it("should validate min length", () => {
			const schema = s.array(s.string()).min(2);
			expect(schema.parse(["a", "b"])).toEqual(["a", "b"]);
			const result = schema.safeParse(["a"]);
			expect(result.success).toBe(false);
		});

		it("should validate max length", () => {
			const schema = s.array(s.string()).max(2);
			expect(schema.parse(["a", "b"])).toEqual(["a", "b"]);
			const result = schema.safeParse(["a", "b", "c"]);
			expect(result.success).toBe(false);
		});

		it("should validate exact length", () => {
			const schema = s.array(s.string()).length(2);
			expect(schema.parse(["a", "b"])).toEqual(["a", "b"]);
			const result = schema.safeParse(["a"]);
			expect(result.success).toBe(false);
		});

		it("should validate nonempty", () => {
			const schema = s.array(s.string()).nonempty();
			expect(schema.parse(["a"])).toEqual(["a"]);
			const result = schema.safeParse([]);
			expect(result.success).toBe(false);
		});

		it("should support nested arrays", () => {
			const schema = s.array(s.array(s.number()));
			expect(schema.parse([[1, 2], [3, 4]])).toEqual([[1, 2], [3, 4]]);
		});
	});

	describe("UnionSchema", () => {
		it("should parse union types", () => {
			const schema = s.union(s.string(), s.number());
			expect(schema.parse("hello")).toBe("hello");
			expect(schema.parse(42)).toBe(42);
		});

		it("should reject invalid union values", () => {
			const schema = s.union(s.string(), s.number());
			const result = schema.safeParse(true);
			expect(result.success).toBe(false);
		});

		it("should work with or alias", () => {
			const schema = s.or(s.string(), s.number());
			expect(schema.parse("hello")).toBe("hello");
			expect(schema.parse(42)).toBe(42);
		});
	});

	describe("LiteralSchema", () => {
		it("should parse literal values", () => {
			const schema = s.literal("hello");
			expect(schema.parse("hello")).toBe("hello");
		});

		it("should reject non-matching literals", () => {
			const schema = s.literal("hello");
			const result = schema.safeParse("world");
			expect(result.success).toBe(false);
		});

		it("should support number literals", () => {
			const schema = s.literal(42);
			expect(schema.parse(42)).toBe(42);
		});

		it("should support boolean literals", () => {
			const schema = s.literal(true);
			expect(schema.parse(true)).toBe(true);
		});
	});

	describe("EnumSchema", () => {
		it("should parse enum values", () => {
			const schema = s.enum({ A: "a", B: "b", C: "c" });
			expect(schema.parse("a")).toBe("a");
			expect(schema.parse("b")).toBe("b");
		});

		it("should reject non-enum values", () => {
			const schema = s.enum({ A: "a", B: "b" });
			const result = schema.safeParse("c");
			expect(result.success).toBe(false);
		});

		it("should support numeric enums", () => {
			const schema = s.enum({ ONE: 1, TWO: 2 });
			expect(schema.parse(1)).toBe(1);
			expect(schema.parse(2)).toBe(2);
		});
	});

	describe("Coerce Schemas", () => {
		it("should coerce to string", () => {
			const schema = s.coerce.string();
			expect(schema.parse(123)).toBe("123");
		});

		it("should coerce to number", () => {
			const schema = s.coerce.number();
			expect(schema.parse("42")).toBe(42);
		});

		it("should coerce to boolean", () => {
			const schema = s.coerce.boolean();
			expect(schema.parse(1)).toBe(true);
			expect(schema.parse(0)).toBe(false);
		});

		it("should reject invalid coercion to number", () => {
			const schema = s.coerce.number();
			const result = schema.safeParse("not-a-number");
			expect(result.success).toBe(false);
		});
	});

	describe("Special Schemas", () => {
		it("should parse any value", () => {
			const schema = s.any();
			expect(schema.parse("hello")).toBe("hello");
			expect(schema.parse(42)).toBe(42);
			expect(schema.parse({})).toEqual({});
		});

		it("should parse unknown value", () => {
			const schema = s.unknown();
			expect(schema.parse("hello")).toBe("hello");
			expect(schema.parse(42)).toBe(42);
		});

		it("should never parse", () => {
			const schema = s.never();
			const result = schema.safeParse("anything");
			expect(result.success).toBe(false);
		});

		it("should parse null", () => {
			const schema = s.null();
			expect(schema.parse(null)).toBe(null);
		});

		it("should parse undefined", () => {
			const schema = s.undefined();
			expect(schema.parse(undefined)).toBe(undefined);
		});
	});

	describe("Custom Validation", () => {
		it("should support refine", () => {
			const schema = s.string().refine((val) => val.length > 5, "String must be longer than 5");
			expect(schema.parse("hello world")).toBe("hello world");
			const result = schema.safeParse("hi");
			expect(result.success).toBe(false);
		});

		it("should support transform", () => {
			const schema = s.string().transform((val) => val.length);
			expect(schema.parse("hello")).toBe(5);
		});

		it("should chain transformations", () => {
			const schema = s.string()
				.trim()
				.lowercase()
				.transform((val) => val.split(""));
			expect(schema.parse("  HELLO  ")).toEqual(["h", "e", "l", "l", "o"]);
		});
	});

	describe("Error Handling", () => {
		it("should throw SchemaParseError on parse failure", () => {
			const schema = s.string();
			expect(() => schema.parse(123)).toThrow(SchemaParseError);
		});

		it("should include error details in SchemaParseError", () => {
			const schema = s.string();
			try {
				schema.parse(123);
			} catch (error) {
				expect(error).toBeInstanceOf(SchemaParseError);
				if (error instanceof SchemaParseError) {
					expect(error.errors.length).toBeGreaterThan(0);
					expect(error.errors[0].code).toBe("invalid_type");
				}
			}
		});

		it("should collect multiple errors", () => {
			const schema = s.object({
				name: s.string(),
				age: s.number().min(0),
				email: s.string().email(),
			});
			const result = schema.safeParse({
				name: 123,
				age: -5,
				email: "invalid",
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.length).toBeGreaterThan(1);
			}
		});

		it("should include path in errors", () => {
			const schema = s.object({
				user: s.object({
					name: s.string(),
				}),
			});
			const result = schema.safeParse({
				user: { name: 123 },
			});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors[0].path).toContain("user");
				expect(result.errors[0].path).toContain("name");
			}
		});
	});

	describe("Type Inference", () => {
		it("should infer string type", () => {
			const schema = s.string();
			type T = Infer<typeof schema>;
			const value: T = "hello";
			expect(value).toBe("hello");
		});

		it("should infer number type", () => {
			const schema = s.number();
			type T = Infer<typeof schema>;
			const value: T = 42;
			expect(value).toBe(42);
		});

		it("should infer object type", () => {
			const schema = s.object({
				name: s.string(),
				age: s.number(),
			});
			type T = Infer<typeof schema>;
			const value: T = { name: "John", age: 30 };
			expect(value).toEqual({ name: "John", age: 30 });
		});

		it("should infer array type", () => {
			const schema = s.array(s.string());
			type T = Infer<typeof schema>;
			const value: T = ["a", "b"];
			expect(value).toEqual(["a", "b"]);
		});

		it("should infer union type", () => {
			const schema = s.union(s.string(), s.number());
			type T = Infer<typeof schema>;
			const value1: T = "hello";
			const value2: T = 42;
			expect(value1).toBe("hello");
			expect(value2).toBe(42);
		});

		it("should infer optional type", () => {
			const schema = s.string().optional();
			type T = Infer<typeof schema>;
			const value1: T = "hello";
			const value2: T = undefined;
			expect(value1).toBe("hello");
			expect(value2).toBe(undefined);
		});
	});

	describe("Branded Types", () => {
		it("should create branded string", () => {
			const schema = s.string().brand("Email");
			const result = schema.parse("test@example.com");
			expect(result).toBe("test@example.com");
		});
	});

	describe("Complex Examples", () => {
		it("should parse user schema", () => {
			const userSchema = s.object({
				id: s.string().uuid(),
				name: s.string().min(1).max(100),
				email: s.string().email(),
				age: s.number().int().min(0).max(150).optional(),
				tags: s.array(s.string()).default([]),
				metadata: s.object({}).optional(),
			});

			const result = userSchema.parse({
				id: "550e8400-e29b-41d4-a716-446655440000",
				name: "John Doe",
				email: "john@example.com",
				age: 30,
				tags: ["developer", "typescript"],
			});

			expect(result.id).toBe("550e8400-e29b-41d4-a716-446655440000");
			expect(result.name).toBe("John Doe");
			expect(result.email).toBe("john@example.com");
			expect(result.age).toBe(30);
			expect(result.tags).toEqual(["developer", "typescript"]);
		});

		it("should parse API response schema", () => {
			const apiResponseSchema = s.object({
				success: s.boolean(),
				data: s.union(
					s.object({ type: s.literal("user"), user: s.object({ id: s.string(), name: s.string() }) }),
					s.object({ type: s.literal("error"), message: s.string() }),
				),
				timestamp: s.string().optional(),
			});

			const result = apiResponseSchema.parse({
				success: true,
				data: { type: "user", user: { id: "1", name: "John" } },
				timestamp: new Date().toISOString(),
			});

			expect(result.success).toBe(true);
			expect(result.data.type).toBe("user");
		});
	});
});
