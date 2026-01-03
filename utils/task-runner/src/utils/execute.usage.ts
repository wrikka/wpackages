import { isOk } from "../types/result";
import { execute, executeStream, executeSync } from "./execute";

// Example 1: Basic command execution
console.log("=== Basic Execution ===");
const result1 = await execute({
	command: "echo",
	args: ["Hello, World!"],
});

if (isOk(result1)) {
	console.log("Output:", result1.value.stdout);
	console.log("Duration:", result1.value.duration, "ms");
} else {
	console.error("Error:", result1.error.message);
}

// Example 2: Command with working directory
console.log("\n=== With Working Directory ===");
const result2 = await execute({
	command: "pwd",
	cwd: "/tmp",
});

if (isOk(result2)) {
	console.log("Current directory:", result2.value.stdout);
}

// Example 3: Command with environment variables
console.log("\n=== With Environment Variables ===");
const result3 = await execute({
	command: process.platform === "win32" ? "cmd" : "sh",
	args: process.platform === "win32"
		? ["/c", "echo", "%MY_VAR%"]
		: ["-c", "echo $MY_VAR"],
	env: { MY_VAR: "custom value" },
});

if (isOk(result3)) {
	console.log("Environment variable:", result3.value.stdout);
}

// Example 4: Command with timeout
console.log("\n=== With Timeout ===");
const result4 = await execute({
	command: "echo",
	args: ["quick"],
	timeout: 5000,
});

if (isOk(result4)) {
	console.log("Completed within timeout:", result4.value.stdout);
}

// Example 5: Streaming output
console.log("\n=== Streaming Output ===");
const result5 = await executeStream(
	{
		command: "echo",
		args: ["Streaming", "output"],
	},
	{
		onStdout: (chunk) => {
			console.log("STDOUT chunk:", chunk.trim());
		},
		onStderr: (chunk) => {
			console.log("STDERR chunk:", chunk.trim());
		},
		onOutput: (_chunk) => {
			// Combined stdout + stderr
		},
	},
);

if (isOk(result5)) {
	console.log("Stream complete");
}

// Example 6: Verbose mode (shows output in real-time)
console.log("\n=== Verbose Mode ===");
await execute({
	command: "echo",
	args: ["Verbose", "output"],
	verbose: true,
});

// Example 7: Dry run mode (don't actually execute)
console.log("\n=== Dry Run Mode ===");
const result7 = await execute({
	command: "rm",
	args: ["-rf", "/"],
	dryRun: true, // Safe! Won't actually execute
});

if (isOk(result7)) {
	console.log("Dry run completed (not executed)");
}

// Example 8: Synchronous execution
console.log("\n=== Synchronous Execution ===");
const result8 = executeSync({
	command: "echo",
	args: ["Sync", "output"],
});

if (isOk(result8)) {
	console.log("Sync output:", result8.value.stdout);
}

// Example 9: Handle errors with rejectOnError
console.log("\n=== Error Handling ===");
const result9 = await execute({
	command: "ls",
	args: ["/nonexistent"],
	rejectOnError: true,
});

if (!isOk(result9)) {
	console.error("Command failed:");
	console.error("Exit code:", result9.error.exitCode);
	console.error("Stderr:", result9.error.stderr);
}

// Example 10: Prefer local binaries
console.log("\n=== Prefer Local Binaries ===");
const result10 = await execute({
	command: "tsc",
	args: ["--version"],
	preferLocal: true, // Look in node_modules/.bin first
	rejectOnError: false,
});

if (isOk(result10)) {
	console.log("TypeScript version:", result10.value.stdout);
} else {
	console.log("TypeScript not found locally");
}
