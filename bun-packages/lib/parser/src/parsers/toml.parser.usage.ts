/**
 * TOML Parser usage examples
 */

import { Result } from "../utils";
import { parseTOMLSource } from "./toml.parser";

// === Basic Usage ===
console.log("=== TOML Parser Usage Examples ===\n");

// 1. Parse simple TOML
const simpleTOML = `
title = "My Application"
version = "1.0.0"
description = "A sample application"
`;
const simpleResult = parseTOMLSource(simpleTOML, "config.toml");
if (Result.isOk(simpleResult)) {
	console.log("✓ Simple TOML parsed:");
	console.log("  Data:", simpleResult.value.data);
}

// 2. Parse TOML with sections
const packageTOML = `
[package]
name = "my-rust-app"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = "1.0"
tokio = "1.0"
`;
const packageResult = parseTOMLSource(packageTOML, "Cargo.toml");
if (Result.isOk(packageResult)) {
	console.log("\n✓ Package TOML parsed:");
	console.log("  Data:", JSON.stringify(packageResult.value.data, null, 2));
}

// 3. Parse TOML with arrays
const arrayTOML = `
colors = ["red", "green", "blue"]
numbers = [1, 2, 3, 4, 5]

[[products]]
name = "Hammer"
sku = 738594937

[[products]]
name = "Nail"
sku = 284758393
`;
const arrayResult = parseTOMLSource(arrayTOML, "arrays.toml");
if (Result.isOk(arrayResult)) {
	console.log("\n✓ TOML with arrays parsed:");
	const arrayData = arrayResult.value.data as Record<string, unknown>;
	console.log("  Colors:", arrayData["colors"]);
	console.log("  Products:", arrayData["products"]);
}

// 4. Parse nested TOML
const nestedTOML = `
[server]
host = "localhost"
port = 8080

[server.ssl]
enabled = true
cert = "/path/to/cert.pem"
key = "/path/to/key.pem"

[database]
connection = "postgres://localhost/mydb"

[database.pool]
max_size = 10
min_size = 2
`;
const nestedResult = parseTOMLSource(nestedTOML, "nested.toml");
if (Result.isOk(nestedResult)) {
	console.log("\n✓ Nested TOML parsed:");
	console.log("  Data:", JSON.stringify(nestedResult.value.data, null, 2));
}

// 5. Parse TOML with different types
const typesTOML = `
string = "Hello, TOML!"
integer = 42
float = 3.14159
boolean = true
date = 2024-01-01T00:00:00Z

# Multi-line strings
multiline = """
This is a
multi-line
string"""
`;
const typesResult = parseTOMLSource(typesTOML, "types.toml");
if (Result.isOk(typesResult)) {
	console.log("\n✓ Various types in TOML:");
	const typesData = typesResult.value.data as Record<string, unknown>;
	console.log("  String:", typesData["string"]);
	console.log("  Integer:", typesData["integer"]);
	console.log("  Float:", typesData["float"]);
	console.log("  Boolean:", typesData["boolean"]);
	console.log("  Date:", typesData["date"]);
}

// 6. Handle parsing errors
const invalidTOML = "[invalid\nkey = value"; // Missing closing bracket
const errorResult = parseTOMLSource(invalidTOML, "invalid.toml");
if (Result.isErr(errorResult)) {
	console.log("\n✗ Invalid TOML:");
	console.log("  Error:", errorResult.error);
}

// 7. Access metadata
const metaResult = parseTOMLSource("key = 'value'", "meta.toml");
if (Result.isOk(metaResult)) {
	console.log("\n✓ Metadata:");
	console.log("  Filename:", metaResult.value.metadata?.["filename"]);
	console.log("  Size:", metaResult.value.metadata?.["size"], "bytes");
	console.log("  Language:", metaResult.value.language);
}

console.log("\n=== End of Examples ===");
