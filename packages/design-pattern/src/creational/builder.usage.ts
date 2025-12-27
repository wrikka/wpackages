/**
 * Builder Pattern Usage Examples
 */

import { createBuilder } from "./builder";

// Example 1: Building a configuration object
interface Config {
	[key: string]: unknown;
	host: string;
	port: number;
	ssl: boolean;
	timeout: number;
}

const config = createBuilder<Config>({
	host: "localhost",
	port: 3000,
	ssl: true,
	timeout: 5000,
}).build();

console.log("Config:", config);

// Example 2: Building a user object
interface User {
	[key: string]: unknown;
	id: string;
	name: string;
	email: string;
	role: "admin" | "user";
	active: boolean;
}

const user = createBuilder<User>({
	id: "user-123",
	name: "John Doe",
	email: "john@example.com",
	role: "admin",
	active: true,
}).build();

console.log("User:", user);

// Example 3: Building with partial configuration
const devConfig = createBuilder<Partial<Config>>({
	host: "localhost",
	ssl: true,
	port: 3000,
	timeout: 5000,
}).build();

const prodConfig = createBuilder<Partial<Config>>({
	host: "localhost",
	ssl: true,
	port: 8080,
	timeout: 30000,
}).build();

console.log("Dev Config:", devConfig);
console.log("Prod Config:", prodConfig);
