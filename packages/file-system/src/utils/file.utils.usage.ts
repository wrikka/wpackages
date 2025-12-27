/**
 * ตัวอย่างการใช้งาน isTextFile
 *
 * Run: bun run packages/file-system/src/utils/file.utils.usage.ts
 */

import { formatFileSize, getMimeType, isCodeFile, isConfigFile, isImageFile, isTextFile } from "./file.utils";

// Example: Check file types
console.log("File type checks:");
console.log("isTextFile('document.txt'):", isTextFile("document.txt"));
console.log("isCodeFile('script.ts'):", isCodeFile("script.ts"));
console.log("isConfigFile('config.json'):", isConfigFile("config.json"));
console.log("isImageFile('photo.png'):", isImageFile("photo.png"));

// Example: Format file size
console.log("\nFile size formatting:");
console.log("formatFileSize(1024):", formatFileSize(1024));
console.log("formatFileSize(1048576):", formatFileSize(1048576));

// Example: Get MIME type
console.log("\nMIME types:");
console.log("getMimeType('document.pdf'):", getMimeType("document.pdf"));
console.log("getMimeType('image.svg'):", getMimeType("image.svg"));
