import { mergeEnvs, parseEnvContent, serializeEnv } from "./parse.utils";

// Example 1: Parse .env content
console.log("Parse .env Content:");
const envContent = `
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp

# API Configuration
API_KEY=secret123
API_URL="https://api.example.com"

# Features
ENABLE_CACHE=true
`;

const parsed = parseEnvContent(envContent);
console.log("Parsed:", parsed);

// Example 2: Serialize to .env format
console.log("\nSerialize Env:");
const env = {
	NODE_ENV: "production",
	PORT: "3000",
	DATABASE_URL: "postgres://localhost:5432/myapp",
	SECRET_KEY: "super secret key",
};

const serialized = serializeEnv(env);
console.log("Serialized:\n", serialized);

// Example 3: Merge multiple environments
console.log("\nMerge Envs:");
const defaultEnv = {
	NODE_ENV: "development",
	PORT: "3000",
	LOG_LEVEL: "debug",
};

const productionEnv = {
	NODE_ENV: "production",
	LOG_LEVEL: "info",
	API_URL: "https://api.prod.example.com",
};

const merged = mergeEnvs(defaultEnv, productionEnv);
console.log("Merged:", merged);

// Example 4: Load and parse from string
console.log("\nParse Complex Env:");
const complexEnv = `
# Multi-line value
DESCRIPTION="This is a
multi-line
description"

# With variables
BASE_URL=https://example.com
API_ENDPOINT=$BASE_URL/api

# Special characters
PASSWORD="p@ssw0rd#123"
`;

const complexParsed = parseEnvContent(complexEnv);
console.log("Complex parsed:", complexParsed);
