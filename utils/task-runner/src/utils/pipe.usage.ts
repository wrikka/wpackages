import { isOk } from "../types/result";
import { executePipe, pipe, pipeWithOptions } from "./pipe";

// Example 1: Simple pipe - echo | grep
console.log("=== Simple Pipe ===");
const result1 = await executePipe({
	commands: [
		{
			command: "echo",
			args: ["hello world foo bar"],
		},
		{
			command: process.platform === "win32" ? "findstr" : "grep",
			args: ["foo"],
		},
	],
});

if (isOk(result1)) {
	console.log("Piped output:", result1.value.stdout);
} else {
	console.error("Pipe failed:", result1.error.message);
}

// Example 2: Multiple commands in pipe
console.log("\n=== Multiple Commands ===");
const result2 = await executePipe({
	commands: [
		{
			command: "echo",
			args: ["line1\nline2\nline3"],
		},
		{
			command: process.platform === "win32" ? "findstr" : "grep",
			args: ["line"],
		},
		{
			command: process.platform === "win32" ? "find" : "wc",
			args: process.platform === "win32" ? ["/c", "/v", "\"\""] : ["-l"],
		},
	],
});

if (isOk(result2)) {
	console.log("Line count:", result2.value.stdout.trim());
}

// Example 3: Pipe with timeout
console.log("\n=== Pipe With Timeout ===");
const result3 = await executePipe({
	commands: [
		{
			command: "echo",
			args: ["quick output"],
		},
		{
			command: "cat",
		},
	],
	timeout: 5000, // Overall timeout for entire pipe
});

if (isOk(result3)) {
	console.log("Completed within timeout");
}

// Example 4: Fail fast on error
console.log("\n=== Fail Fast ===");
const result4 = await executePipe({
	commands: [
		{
			command: "echo",
			args: ["step 1"],
		},
		{
			command: "false", // This will fail
			shell: true,
		},
		{
			command: "echo",
			args: ["step 3 - should not run"],
		},
	],
	failFast: true, // Stop on first error
});

if (!isOk(result4)) {
	console.log("Pipe stopped at failed command");
}

// Example 5: Continue on error
console.log("\n=== Continue On Error ===");
const result5 = await executePipe({
	commands: [
		{
			command: "echo",
			args: ["step 1"],
		},
		{
			command: "false", // This will fail
			shell: true,
			rejectOnError: false,
		},
		{
			command: "echo",
			args: ["step 3 - will still run"],
		},
	],
	failFast: false, // Continue even on error
});

if (isOk(result5)) {
	console.log("Pipe completed all commands despite errors");
}

// Example 6: Using pipe helper
console.log("\n=== Using Pipe Helper ===");
const pipeOpts = pipe(
	{
		command: "ls",
		args: ["-la"],
	},
	{
		command: process.platform === "win32" ? "findstr" : "grep",
		args: [".ts"],
	},
);

const result6 = await executePipe(pipeOpts);

if (isOk(result6)) {
	console.log("TypeScript files:", result6.value.stdout);
}

// Example 7: Using pipeWithOptions
console.log("\n=== Using Pipe With Options ===");
const pipeOpts2 = pipeWithOptions(
	[
		{
			command: "echo",
			args: ["data"],
		},
		{
			command: "cat",
		},
	],
	{
		timeout: 10000,
		failFast: true,
	},
);

const result7 = await executePipe(pipeOpts2);

if (isOk(result7)) {
	console.log("Result:", result7.value.stdout);
}

// Example 8: Git operations pipe
console.log("\n=== Git Operations Pipe ===");
const result8 = await executePipe({
	commands: [
		{
			command: "git",
			args: ["status", "--short"],
		},
		{
			command: process.platform === "win32" ? "findstr" : "grep",
			args: ["^M"],
		},
	],
	failFast: false,
});

if (isOk(result8)) {
	console.log("Modified files:", result8.value.stdout || "None");
}

// Example 9: Data transformation pipe
console.log("\n=== Data Transformation Pipe ===");
const result9 = await executePipe({
	commands: [
		{
			command: "echo",
			args: ["apple,banana,cherry"],
		},
		{
			// Replace comma with newline
			command: process.platform === "win32" ? "cmd" : "tr",
			args: process.platform === "win32" ? ["/c", "echo %input%"] : [",", "\\n"],
		},
	],
});

if (isOk(result9)) {
	console.log("Transformed:", result9.value.stdout);
}

// Example 10: NPM/Package manager pipe
console.log("\n=== Package Manager Pipe ===");
const result10 = await executePipe({
	commands: [
		{
			command: "npm",
			args: ["list", "--depth=0"],
			rejectOnError: false,
		},
		{
			command: process.platform === "win32" ? "findstr" : "grep",
			args: ["typescript"],
		},
	],
	failFast: false,
});

if (isOk(result10)) {
	console.log("TypeScript package:", result10.value.stdout || "Not found");
}
