/**
 * Usage example for case-converter utility
 */
import {
	convertCase,
	toCamelCase,
	toConstantCase,
	toKebabCase,
	toPascalCase,
	toSnakeCase,
} from "./case-converter.util";

// Convert to different case styles
const input = "hello world example";

console.log("Original:", input);
console.log("PascalCase:", toPascalCase(input));
console.log("camelCase:", toCamelCase(input));
console.log("kebab-case:", toKebabCase(input));
console.log("snake_case:", toSnakeCase(input));
console.log("CONSTANT_CASE:", toConstantCase(input));

// Using convertCase with style parameter
console.log("\nUsing convertCase:");
console.log("Pascal:", convertCase(input, "pascal"));
console.log("Camel:", convertCase(input, "camel"));
console.log("Kebab:", convertCase(input, "kebab"));

// Preserve acronyms
const apiInput = "API response handler";
console.log("\nWith acronyms:");
console.log("Preserved:", toPascalCase(apiInput, { preserveAcronyms: true }));
console.log("Normal:", toPascalCase(apiInput));
