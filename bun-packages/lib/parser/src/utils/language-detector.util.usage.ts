/**
 * ตัวอย่างการใช้งาน language-detector utilities
 *
 * Run: bun run packages/parser/src/utils/language-detector.util.usage.ts
 */

import {
	detectLanguage,
	getLanguageInfo,
	getLanguagesByCategory,
	getSupportedLanguages,
	supportsAST,
} from "./language-detector.util";

console.log("--- Language Detection ---");
console.log("Detecting \"component.tsx\":", detectLanguage("component.tsx"));
console.log("Detecting \"style.scss\":", detectLanguage("style.scss"));
console.log("Detecting \"README.md\":", detectLanguage("README.md"));
console.log("Detecting \"Dockerfile\":", detectLanguage("Dockerfile")); // unknown

console.log("\n--- Get Language Info ---");
console.log("Info for \"typescript\":", getLanguageInfo("typescript"));

console.log("\n--- Check AST Support ---");
console.log("Does \"typescript\" support AST?", supportsAST("typescript"));
console.log("Does \"json\" support AST?", supportsAST("json"));

console.log("\n--- Get Supported Languages ---");
console.log("All supported languages:", getSupportedLanguages().join(", "));

console.log("\n--- Get Languages by Category ---");
console.log("\"code\" languages:", getLanguagesByCategory("code").join(", "));
console.log("\"data\" languages:", getLanguagesByCategory("data").join(", "));
