/**
 * JSON Parser usage examples
 */

import { Result } from "../utils";
import { parseJSON } from "./json.parser";

// === Basic Usage ===
console.log("=== JSON Parser Usage Examples ===\n");

// 1. Parse simple JSON object
const simpleResult = parseJSON("{\"name\": \"John\", \"age\": 30}", "user.json");
if (Result.isOk(simpleResult)) {
	console.log("✓ Simple JSON parsed:");
	console.log("  Data:", simpleResult.value.data);
	console.log("  Language:", simpleResult.value.language);
}

// 2. Parse JSON array
const arrayResult = parseJSON("[1, 2, 3, 4, 5]", "numbers.json");
if (Result.isOk(arrayResult)) {
	console.log("\n✓ JSON array parsed:");
	console.log("  Data:", arrayResult.value.data);
}

// 3. Parse nested JSON
const nestedJSON = `{
  "user": {
    "name": "Jane",
    "contact": {
      "email": "jane@example.com",
      "phone": "123-456-7890"
    }
  }
}`;
const nestedResult = parseJSON(nestedJSON, "nested.json");
if (Result.isOk(nestedResult)) {
	console.log("\n✓ Nested JSON parsed:");
	console.log("  Data:", JSON.stringify(nestedResult.value.data, null, 2));
}

// 4. Handle parsing errors
const invalidJSON = "{\"name\": \"test\",}"; // Trailing comma
const errorResult = parseJSON(invalidJSON, "invalid.json");
if (Result.isErr(errorResult)) {
	console.log("\n✗ Invalid JSON:");
	console.log("  Error:", errorResult.error);
}

// 5. Use custom reviver
const customReviver = (key: string, value: unknown) => {
	if (key === "date") {
		return new Date(value as string);
	}
	return value;
};

const dateJSON = "{\"name\": \"Event\", \"date\": \"2024-01-01T00:00:00Z\"}";
const reviverResult = parseJSON(dateJSON, "event.json", { reviver: customReviver });
if (Result.isOk(reviverResult)) {
	console.log("\n✓ JSON with custom reviver:");
	const data = reviverResult.value.data as Record<string, unknown>;
	console.log("  Date object:", data["date"] instanceof Date);
	console.log("  Data:", data);
}

// 6. Access metadata
const metaResult = parseJSON("{\"test\": true}", "meta.json");
if (Result.isOk(metaResult)) {
	console.log("\n✓ Metadata:");
	console.log("  Filename:", metaResult.value.metadata?.["filename"]);
	console.log("  Size:", metaResult.value.metadata?.["size"], "bytes");
}

console.log("\n=== End of Examples ===");
