/**
 * YAML Parser usage examples
 */

import { Result } from "../utils";
import { parseYAML_source, stringifyYAML } from "./yaml.parser";

// === Basic Usage ===
console.log("=== YAML Parser Usage Examples ===\n");

// 1. Parse simple YAML
const simpleYAML = `
name: John Doe
age: 30
active: true
`;
const simpleResult = parseYAML_source(simpleYAML, "user.yaml");
if (Result.isOk(simpleResult)) {
	console.log("✓ Simple YAML parsed:");
	console.log("  Data:", simpleResult.value.data);
}

// 2. Parse YAML array
const arrayYAML = `
- apple
- banana
- cherry
`;
const arrayResult = parseYAML_source(arrayYAML, "fruits.yaml");
if (Result.isOk(arrayResult)) {
	console.log("\n✓ YAML array parsed:");
	console.log("  Data:", arrayResult.value.data);
}

// 3. Parse nested YAML
const nestedYAML = `
user:
  name: Jane Smith
  contact:
    email: jane@example.com
    phone: 123-456-7890
  addresses:
    - city: New York
      zip: 10001
    - city: Los Angeles
      zip: 90001
`;
const nestedResult = parseYAML_source(nestedYAML, "nested.yaml");
if (Result.isOk(nestedResult)) {
	console.log("\n✓ Nested YAML parsed:");
	console.log("  Data:", JSON.stringify(nestedResult.value.data, null, 2));
}

// 4. Parse multi-line strings
const multilineYAML = `
description: |
  This is a multi-line description
  that preserves line breaks
  and formatting.
summary: >
  This is a folded string
  that removes line breaks
  and creates a single line.
`;
const multilineResult = parseYAML_source(multilineYAML, "multiline.yaml");
if (Result.isOk(multilineResult)) {
	console.log("\n✓ Multi-line YAML parsed:");
	console.log("  Data:", multilineResult.value.data);
}

// 5. Parse YAML with comments
const commentYAML = `
# This is a comment
name: Test  # inline comment
# Another comment
age: 25
`;
const commentResult = parseYAML_source(commentYAML, "comments.yaml");
if (Result.isOk(commentResult)) {
	console.log("\n✓ YAML with comments parsed:");
	console.log("  Data:", commentResult.value.data);
}

// 6. Stringify data to YAML
const data = {
	name: "Alice",
	age: 28,
	hobbies: ["reading", "coding", "hiking"],
	address: {
		city: "Boston",
		zip: "02101",
	},
};
const yamlString = stringifyYAML(data);
console.log("\n✓ Stringify to YAML:");
console.log(yamlString);

// 7. Round-trip: Parse and stringify
const originalYAML = "name: Bob\nage: 35\ncity: Seattle";
const parseResult = parseYAML_source(originalYAML, "roundtrip.yaml");
if (Result.isOk(parseResult)) {
	const roundtripYAML = stringifyYAML(parseResult.value.data);
	console.log("\n✓ Round-trip (parse → stringify):");
	console.log("  Original:", originalYAML);
	console.log("  Round-trip:", roundtripYAML.trim());
}

// 8. Access metadata
const metaResult = parseYAML_source("test: value", "meta.yaml");
if (Result.isOk(metaResult)) {
	console.log("\n✓ Metadata:");
	console.log("  Filename:", metaResult.value.metadata?.["filename"]);
	console.log("  Size:", metaResult.value.metadata?.["size"], "bytes");
	console.log("  Language:", metaResult.value.language);
}

console.log("\n=== End of Examples ===");
