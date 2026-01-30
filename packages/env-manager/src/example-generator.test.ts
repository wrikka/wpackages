import { describe, expect, it } from "vitest";
import { generateExample } from "./utils/example-generator";

describe("example generator", () => {
	it("should generate example with comments", () => {
		const env = {
			PORT: "3000",
			DATABASE_URL: "postgres://localhost:5432/mydb",
			API_KEY: "secret123",
			NODE_ENV: "production",
		};

		const result = generateExample(env, { includeComments: true });

		expect(result).toContain("# Environment Variables Example");
		expect(result).toContain("# Copy this file to .env and fill in the actual values");
		expect(result).toContain("# PORT - Server port number");
		expect(result).toContain("# DATABASE_URL - Database connection string");
		expect(result).toContain("# API_KEY - Sensitive value (masked)");
		expect(result).toContain("# NODE_ENV - Environment (development, production, test)");
	});

	it("should generate example without comments", () => {
		const env = {
			PORT: "3000",
			NODE_ENV: "development",
		};

		const result = generateExample(env, { includeComments: false });

		expect(result).not.toContain("#");
		expect(result).toContain("PORT=");
		expect(result).toContain("NODE_ENV=");
	});

	it("should mask sensitive values", () => {
		const env = {
			PASSWORD: "mysecretpassword",
			API_KEY: "secret123",
			TOKEN: "abc123",
		};

		const result = generateExample(env, { maskSensitive: true });

		expect(result).toContain("PASSWORD=**");
		expect(result).toContain("API_KEY=**");
		expect(result).toContain("TOKEN=**");
	});

	it("should not mask when maskSensitive is false", () => {
		const env = {
			PASSWORD: "mysecretpassword",
			API_KEY: "secret123",
		};

		const result = generateExample(env, { maskSensitive: false });

		expect(result).toContain("PASSWORD=your_value_here");
		expect(result).toContain("API_KEY=your_value_here");
	});

	it("should provide example values based on key names", () => {
		const env = {
			PORT: "8080",
			HOST: "example.com",
			EMAIL: "test@test.com",
			ENABLED: "false",
			DEBUG: "true",
		};

		const result = generateExample(env, { maskSensitive: false, includeComments: false });

		expect(result).toContain("PORT=3000");
		expect(result).toContain("HOST=http://localhost:3000");
		expect(result).toContain("EMAIL=user@example.com");
		expect(result).toContain("ENABLED=true");
		expect(result).toContain("DEBUG=true");
	});

	it("should skip undefined and null values", () => {
		const env = {
			PORT: "3000",
			UNDEFINED_VAR: undefined,
			NULL_VAR: null,
			VALID_VAR: "value",
		};

		const result = generateExample(env, { includeComments: false });

		expect(result).toContain("PORT=");
		expect(result).toContain("VALID_VAR=");
		expect(result).not.toContain("UNDEFINED_VAR=");
		expect(result).not.toContain("NULL_VAR=");
	});

	it("should sort keys alphabetically", () => {
		const env = {
			Z_VAR: "z",
			A_VAR: "a",
			M_VAR: "m",
		};

		const result = generateExample(env, { includeComments: false });

		const lines = result.split("\n").filter((line) => line.includes("="));
		expect(lines[0]).toContain("A_VAR");
		expect(lines[1]).toContain("M_VAR");
		expect(lines[2]).toContain("Z_VAR");
	});
});
