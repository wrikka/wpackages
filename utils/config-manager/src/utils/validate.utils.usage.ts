import type { EnvSchema } from "../types/env";
import { castValue, validateEnv } from "./validate.utils";

// Define schema
const appSchema: EnvSchema<{
	NODE_ENV: string;
	PORT: number;
	API_KEY: string;
	DATABASE_URL: string;
	ENABLE_CACHE: boolean;
	ADMIN_EMAIL: string;
}> = {
	NODE_ENV: {
		type: "string",
		required: true,
		choices: ["development", "production", "test"],
	},
	PORT: {
		type: "number",
		required: true,
		validate: (value) => {
			const port = Number(value);
			return port >= 1024 && port <= 65535
				? true
				: "Port must be between 1024 and 65535";
		},
	},
	API_KEY: {
		type: "string",
		required: true,
		pattern: /^[a-zA-Z0-9_-]{32,}$/,
	},
	DATABASE_URL: {
		type: "url",
		required: true,
	},
	ENABLE_CACHE: {
		type: "boolean",
		required: false,
	},
	ADMIN_EMAIL: {
		type: "email",
		required: false,
	},
};

// Example 1: Validate complete env
console.log("Validate Complete Env:");
const validEnv = {
	NODE_ENV: "production",
	PORT: "3000",
	API_KEY: "abc123def456ghi789jkl012mno345pq",
	DATABASE_URL: "postgres://localhost:5432/myapp",
	ENABLE_CACHE: "true",
	ADMIN_EMAIL: "admin@example.com",
};

const validResult = validateEnv(validEnv, appSchema);
console.log("Valid:", validResult.valid);

// Example 2: Validate invalid env
console.log("\nValidate Invalid Env:");
const invalidEnv = {
	NODE_ENV: "invalid",
	PORT: "abc",
	API_KEY: "short",
	DATABASE_URL: "not-a-url",
};

const invalidResult = validateEnv(invalidEnv, appSchema);
console.log("Valid:", invalidResult.valid);
console.log("Errors:", invalidResult.errors);

// Example 3: Cast values
console.log("\nCast Values:");
console.log("String to number:", castValue("3000", "number"));
console.log("String to boolean:", castValue("true", "boolean"));
console.log("String to array:", castValue("a,b,c", "array"));
console.log("String to JSON:", castValue("{\"key\":\"value\"}", "json"));

// Example 4: Missing required fields
console.log("\nMissing Required Fields:");
const incompleteEnv = {
	NODE_ENV: "development",
};

const incompleteResult = validateEnv(incompleteEnv, appSchema);
console.log("Valid:", incompleteResult.valid);
console.log("Missing fields:", incompleteResult.errors.map((e) => e.key));
