import { describe, expect, test } from "vitest";
import * as S from "./string-utils";

describe("string-utils", () => {
	describe("case conversion", () => {
		test("capitalize", () => {
			expect(S.capitalize("hello")).toBe("Hello");
			expect(S.capitalize("WORLD")).toBe("WORLD");
			expect(S.capitalize("")).toBe("");
		});

		test("lowercase", () => {
			expect(S.lowercase("HELLO")).toBe("hello");
			expect(S.lowercase("HeLLo")).toBe("hello");
		});

		test("uppercase", () => {
			expect(S.uppercase("hello")).toBe("HELLO");
			expect(S.uppercase("HeLLo")).toBe("HELLO");
		});

		test("camelCase", () => {
			expect(S.camelCase("hello world")).toBe("helloWorld");
			expect(S.camelCase("Hello World")).toBe("helloWorld");
			expect(S.camelCase("hello-world")).toBe("helloWorld");
			expect(S.camelCase("hello_world")).toBe("helloWorld");
		});

		test("kebabCase", () => {
			expect(S.kebabCase("helloWorld")).toBe("hello-world");
			expect(S.kebabCase("Hello World")).toBe("hello-world");
			expect(S.kebabCase("hello_world")).toBe("hello-world");
		});

		test("snakeCase", () => {
			expect(S.snakeCase("helloWorld")).toBe("hello_world");
			expect(S.snakeCase("Hello World")).toBe("hello_world");
			expect(S.snakeCase("hello-world")).toBe("hello_world");
		});

		test("pascalCase", () => {
			expect(S.pascalCase("hello world")).toBe("HelloWorld");
			expect(S.pascalCase("Hello World")).toBe("HelloWorld");
		});
	});

	describe("truncation and padding", () => {
		test("truncate", () => {
			expect(S.truncate("hello world", 5)).toBe("he...");
			expect(S.truncate("hello world", 11)).toBe("hello world");
			expect(S.truncate("hello world", 5, "---")).toBe("he---");
		});

		test("trim", () => {
			expect(S.trim("  hello  ")).toBe("hello");
			expect(S.trim("xxhelloxx", "x")).toBe("hello");
		});

		test("trimStart", () => {
			expect(S.trimStart("  hello")).toBe("hello");
			expect(S.trimStart("xxhello", "x")).toBe("hello");
		});

		test("trimEnd", () => {
			expect(S.trimEnd("hello  ")).toBe("hello");
			expect(S.trimEnd("helloxx", "x")).toBe("hello");
		});

		test("padStart", () => {
			expect(S.padStart("5", 2, "0")).toBe("05");
			expect(S.padStart("5", 3)).toBe("  5");
		});

		test("padEnd", () => {
			expect(S.padEnd("5", 2, "0")).toBe("50");
			expect(S.padEnd("5", 3)).toBe("5  ");
		});

		test("repeat", () => {
			expect(S.repeat("ab", 3)).toBe("ababab");
		});
	});

	describe("string analysis", () => {
		test("isEmpty", () => {
			expect(S.isEmpty("")).toBe(true);
			expect(S.isEmpty("hello")).toBe(false);
		});

		test("isBlank", () => {
			expect(S.isBlank("")).toBe(true);
			expect(S.isBlank("   ")).toBe(true);
			expect(S.isBlank("hello")).toBe(false);
		});

		test("reverse", () => {
			expect(S.reverse("hello")).toBe("olleh");
		});

		test("words", () => {
			expect(S.words("hello world")).toEqual(["hello", "world"]);
			expect(S.words("")).toEqual([]);
		});

		test("wordCount", () => {
			expect(S.wordCount("hello world")).toBe(2);
			expect(S.wordCount("")).toBe(0);
		});
	});

	describe("string manipulation", () => {
		test("slugify", () => {
			expect(S.slugify("Hello World!")).toBe("hello-world");
			expect(S.slugify("  hello--world  ")).toBe("hello-world");
		});

		test("stripTags", () => {
			expect(S.stripTags("<p>hello</p>")).toBe("hello");
		});

		test("escapeHtml", () => {
			expect(S.escapeHtml("<div>hello</div>")).toBe("&lt;div&gt;hello&lt;/div&gt;");
		});

		test("unescapeHtml", () => {
			expect(S.unescapeHtml("&lt;div&gt;hello&lt;/div&gt;")).toBe("<div>hello</div>");
		});

		test("initials", () => {
			expect(S.initials("Hello World")).toBe("HW");
		});

		test("shuffle", () => {
			const result = S.shuffle("abc");
			expect(result.length).toBe(3);
			expect(result).toMatch(/^[abc]{3}$/);
		});

		test("count", () => {
			expect(S.count("hello world", "o")).toBe(2);
		});

		test("includes", () => {
			expect(S.includes("hello", "ell")).toBe(true);
			expect(S.includes("hello", "xyz")).toBe(false);
		});

		test("startsWith", () => {
			expect(S.startsWith("hello", "he")).toBe(true);
			expect(S.startsWith("hello", "el")).toBe(false);
		});

		test("endsWith", () => {
			expect(S.endsWith("hello", "lo")).toBe(true);
			expect(S.endsWith("hello", "he")).toBe(false);
		});

		test("replaceAll", () => {
			expect(S.replaceAll("hello world", "l", "x")).toBe("hexxo worxd");
		});
	});

	describe("validation", () => {
		test("isAlpha", () => {
			expect(S.isAlpha("hello")).toBe(true);
			expect(S.isAlpha("hello123")).toBe(false);
		});

		test("isAlphanumeric", () => {
			expect(S.isAlphanumeric("hello123")).toBe(true);
			expect(S.isAlphanumeric("hello!")).toBe(false);
		});

		test("isNumeric", () => {
			expect(S.isNumeric("123")).toBe(true);
			expect(S.isNumeric("123abc")).toBe(false);
		});

		test("isEmail", () => {
			expect(S.isEmail("test@example.com")).toBe(true);
			expect(S.isEmail("invalid")).toBe(false);
		});

		test("isUrl", () => {
			expect(S.isUrl("https://example.com")).toBe(true);
			expect(S.isUrl("not a url")).toBe(false);
		});

		test("isHex", () => {
			expect(S.isHex("abc123")).toBe(true);
			expect(S.isHex("xyz")).toBe(false);
		});

		test("isBase64", () => {
			expect(S.isBase64("SGVsbG8=")).toBe(true);
			expect(S.isBase64("hello!")).toBe(false);
		});

		test("isUuid", () => {
			expect(S.isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
			expect(S.isUuid("not a uuid")).toBe(false);
		});

		test("isJson", () => {
			expect(S.isJson("{\"key\": \"value\"}")).toBe(true);
			expect(S.isJson("not json")).toBe(false);
		});
	});

	describe("type conversion", () => {
		test("toBoolean", () => {
			expect(S.toBoolean("true")).toBe(true);
			expect(S.toBoolean("false")).toBe(false);
		});

		test("toNumber", () => {
			expect(S.toNumber("123.45")).toBe(123.45);
		});

		test("toInt", () => {
			expect(S.toInt("123")).toBe(123);
			expect(S.toInt("ff", 16)).toBe(255);
		});

		test("toFloat", () => {
			expect(S.toFloat("123.45")).toBe(123.45);
		});

		test("template", () => {
			expect(S.template("Hello {{name}}", { name: "World" })).toBe("Hello World");
		});
	});

	describe("masking", () => {
		test("mask", () => {
			expect(S.mask("1234567890", 4, "*")).toBe("1234******");
		});

		test("maskEmail", () => {
			expect(S.maskEmail("test@example.com")).toMatch(/^t\*+@example\.com$/);
		});

		test("maskPhone", () => {
			expect(S.maskPhone("1234567890")).toBe("******7890");
		});
	});

	describe("generation", () => {
		test("generateId", () => {
			const id = S.generateId(8);
			expect(id.length).toBe(8);
		});

		test("generateUuid", () => {
			const uuid = S.generateUuid();
			expect(S.isUuid(uuid)).toBe(true);
		});

		test("generateRandomString", () => {
			const str = S.generateRandomString(16);
			expect(str.length).toBe(16);
		});
	});

	describe("splitting and joining", () => {
		test("chunk", () => {
			expect(S.chunk("abcdefgh", 3)).toEqual(["abc", "def", "gh"]);
		});

		test("split", () => {
			expect(S.split("a,b,c", ",")).toEqual(["a", "b", "c"]);
		});

		test("join", () => {
			expect(S.join(["a", "b", "c"], ",")).toBe("a,b,c");
		});

		test("lines", () => {
			expect(S.lines("a\nb\nc")).toEqual(["a", "b", "c"]);
		});

		test("lineCount", () => {
			expect(S.lineCount("a\nb\nc")).toBe(3);
		});
	});

	describe("indentation", () => {
		test("indent", () => {
			expect(S.indent("a\nb", 2)).toBe("  a\n  b");
		});

		test("dedent", () => {
			expect(S.dedent("  a\n  b")).toBe("a\nb");
		});
	});

	describe("whitespace", () => {
		test("normalizeWhitespace", () => {
			expect(S.normalizeWhitespace("hello   world")).toBe("hello world");
		});

		test("removeWhitespace", () => {
			expect(S.removeWhitespace("hello world")).toBe("helloworld");
		});

		test("removeExtraSpaces", () => {
			expect(S.removeExtraSpaces("hello   world")).toBe("hello world");
		});

		test("removeNewlines", () => {
			expect(S.removeNewlines("a\nb\nc")).toBe("abc");
		});

		test("removeTabs", () => {
			expect(S.removeTabs("a\tb\tc")).toBe("abc");
		});

		test("squeeze", () => {
			expect(S.squeeze("hello   world")).toBe("hello world");
		});
	});

	describe("wrapping and quoting", () => {
		test("surround", () => {
			expect(S.surround("hello", "*")).toBe("*hello*");
		});

		test("quote", () => {
			expect(S.quote("hello")).toBe("\"hello\"");
		});

		test("unquote", () => {
			expect(S.unquote("\"hello\"")).toBe("hello");
			expect(S.unquote("'hello'")).toBe("hello");
		});
	});

	describe("substring extraction", () => {
		test("between", () => {
			expect(S.between("a<b>c", "<", ">")).toBe("b");
		});

		test("before", () => {
			expect(S.before("a@b.com", "@")).toBe("a");
		});

		test("after", () => {
			expect(S.after("a@b.com", "@")).toBe("b.com");
		});

		test("beforeLast", () => {
			expect(S.beforeLast("a.b.c", ".")).toBe("a.b");
		});

		test("afterLast", () => {
			expect(S.afterLast("a.b.c", ".")).toBe("c");
		});
	});

	describe("insertion and removal", () => {
		test("insert", () => {
			expect(S.insert("helo", 2, "l")).toBe("hello");
		});

		test("remove", () => {
			expect(S.remove("hello world", " ")).toBe("helloworld");
		});

		test("removeAt", () => {
			expect(S.removeAt("hello", 1)).toBe("hllo");
		});
	});

	describe("prefix and suffix", () => {
		test("ensurePrefix", () => {
			expect(S.ensurePrefix("hello", "prefix-")).toBe("prefix-hello");
			expect(S.ensurePrefix("prefix-hello", "prefix-")).toBe("prefix-hello");
		});

		test("ensureSuffix", () => {
			expect(S.ensureSuffix("hello", "-suffix")).toBe("hello-suffix");
			expect(S.ensureSuffix("hello-suffix", "-suffix")).toBe("hello-suffix");
		});

		test("stripPrefix", () => {
			expect(S.stripPrefix("prefix-hello", "prefix-")).toBe("hello");
		});

		test("stripSuffix", () => {
			expect(S.stripSuffix("hello-suffix", "-suffix")).toBe("hello");
		});
	});

	describe("similarity", () => {
		test("distance", () => {
			expect(S.distance("kitten", "sitting")).toBe(3);
		});

		test("similarity", () => {
			expect(S.similarity("hello", "hello")).toBe(1);
			expect(S.similarity("hello", "hallo")).toBeGreaterThan(0.5);
		});
	});

	describe("phonetic", () => {
		test("soundex", () => {
			expect(S.soundex("Robert")).toBe("R163");
			expect(S.soundex("Rupert")).toBe("R163");
		});
	});

	describe("hashing", () => {
		test("hashCode", () => {
			expect(typeof S.hashCode("hello")).toBe("number");
		});

		test("crc32", () => {
			expect(typeof S.crc32("hello")).toBe("number");
		});
	});

	describe("encoding", () => {
		test("base64Encode", () => {
			expect(S.base64Encode("hello")).toBe("aGVsbG8=");
		});

		test("base64Decode", () => {
			expect(S.base64Decode("aGVsbG8=")).toBe("hello");
		});

		test("urlEncode", () => {
			expect(S.urlEncode("hello world")).toBe("hello%20world");
		});

		test("urlDecode", () => {
			expect(S.urlDecode("hello%20world")).toBe("hello world");
		});
	});
});
