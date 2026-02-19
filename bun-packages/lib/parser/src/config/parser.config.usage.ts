/**
 * Parser Configuration - Usage Examples
 */

import { PARSER_CONFIG } from "./parser.config";

// Access configuration
console.log("Default options:", PARSER_CONFIG.defaults);
// Output: { strict: false, includeMetadata: true, preserveComments: true }

console.log("Performance settings:", PARSER_CONFIG.performance);
// Output: { maxFileSize: 10485760, enableCaching: true, cacheSize: 100 }

console.log("Error handling:", PARSER_CONFIG.errors);
// Output: { throwOnError: false, collectErrors: true, maxErrors: 100 }

// Use in parser initialization
const parserOptions = {
	...PARSER_CONFIG.defaults,
	strict: true, // Override default
};

console.log("Parser options:", parserOptions);
