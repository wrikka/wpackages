import { formatBytes, formatDuration } from "./format.utils";

// Example 1: Format Duration
console.log("Duration Examples:");
console.log(formatDuration(500)); // "500ms"
console.log(formatDuration(2500)); // "2.5s"
console.log(formatDuration(125000)); // "2m 5s"
console.log(formatDuration(7200000)); // "2h 0m"

// Example 2: Format Bytes
console.log("\nBytes Examples:");
console.log(formatBytes(512)); // "512 B"
console.log(formatBytes(2048)); // "2.00 KB"
console.log(formatBytes(1024 * 1024 * 5)); // "5.00 MB"
console.log(formatBytes(1024 * 1024 * 1024 * 2.5)); // "2.50 GB"

// Example 3: Real-world usage
const fileSize = 1024 * 1024 * 150; // 150 MB
const downloadTime = 45000; // 45 seconds

console.log("\nReal-world Example:");
console.log(
	`Downloaded ${formatBytes(fileSize)} in ${formatDuration(downloadTime)}`,
);
