import type { ParsedEnv } from "../types/env";
import { expandEnv, expandValue, extractVariables, hasVariables } from "./expansion.utils";

// Example 1: Simple variable expansion
console.log("Simple Expansion:");
const env: ParsedEnv = {
	API_KEY: "secret123",
	DB_HOST: "localhost",
};
const result = expandValue("API: ${API_KEY}, Host: ${DB_HOST}", env);
console.log(result);

// Example 2: Nested variable expansion
console.log("\nNested Expansion:");
const nestedEnv: ParsedEnv = {
	BASE_URL: "https://api.example.com",
	API_VERSION: "v1",
	API_ENDPOINT: "${BASE_URL}/${API_VERSION}",
	USERS_URL: "${API_ENDPOINT}/users",
};
const expanded = expandEnv(nestedEnv);
console.log("Users URL:", expanded["USERS_URL"]);

// Example 3: Check for variables
console.log("\nHas Variables:");
console.log("'${API_KEY}':", hasVariables("${API_KEY}"));
console.log("'plain text':", hasVariables("plain text"));

// Example 4: Extract variables
console.log("\nExtract Variables:");
const text = "Connect to ${DB_HOST}:${DB_PORT} with ${DB_USER}";
const variables = extractVariables(text);
console.log("Variables found:", variables);

// Example 5: Real-world config
console.log("\nReal-world Example:");
const configEnv: ParsedEnv = {
	ENV: "production",
	APP_NAME: "MyApp",
	APP_VERSION: "1.0.0",
	LOG_LEVEL: "info",
	DB_HOST: "db.example.com",
	DB_PORT: "5432",
	DB_NAME: "myapp_${ENV}",
	DATABASE_URL: "postgres://${DB_HOST}:${DB_PORT}/${DB_NAME}",
	APP_TITLE: "${APP_NAME} v${APP_VERSION}",
};

const finalConfig = expandEnv(configEnv);
console.log("Database URL:", finalConfig["DATABASE_URL"]);
console.log("App Title:", finalConfig["APP_TITLE"]);
