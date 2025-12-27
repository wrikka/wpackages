/**
 * Factory Pattern Usage Examples
 */

import { createFactory } from "./factory";

// Example 1: Simple object factory
interface Logger {
	type: string;
	log(message: string): void;
}

const loggerFactory = createFactory<string, Logger>((type: string) => ({
	type,
	log: (message: string) => {
		console.log(`[${type}] ${message}`);
	},
}));

const consoleLogger = loggerFactory("console");
const fileLogger = loggerFactory("file");

consoleLogger.log("Hello from console");
fileLogger.log("Hello from file");

// Example 2: Database connection factory
interface Database {
	type: string;
	connect(): Promise<void>;
	query(sql: string): Promise<unknown>;
}

const dbFactory = createFactory<string, Database>((type: string) => ({
	type,
	connect: async () => {
		console.log(`Connecting to ${type} database...`);
	},
	query: async (sql: string) => {
		console.log(`Executing query on ${type}: ${sql}`);
		return [];
	},
}));

const postgresDb = dbFactory("postgres");
const mongoDb = dbFactory("mongodb");

await postgresDb.connect();
await mongoDb.connect();

// Example 3: HTTP client factory
interface HttpClient {
	method: string;
	baseUrl: string;
	request(path: string): Promise<unknown>;
}

const httpClientFactory = createFactory<string, HttpClient>((method: string) => ({
	method,
	baseUrl: "https://api.example.com",
	request: async (path: string) => {
		console.log(`${method} ${path}`);
		return { status: 200 };
	},
}));

const getClient = httpClientFactory("GET");
const postClient = httpClientFactory("POST");

await getClient.request("/users");
await postClient.request("/users");

console.log("Factories created successfully");
