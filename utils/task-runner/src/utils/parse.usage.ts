import {
	buildCommand,
	buildPath,
	getLocalBinPath,
	normalizeOptions,
	parseCommand,
	parseEnv,
	stripFinalNewline,
} from "./parse";

// Example 1: Parse command string
console.log("=== Parse Command ===");
const cmd1 = parseCommand("git commit -m 'Initial commit'");
console.log("Parsed:", cmd1);

const cmd2 = parseCommand(["npm", "install", "--save-dev", "typescript"]);
console.log("Parsed array:", cmd2);

// Example 2: Build command string
console.log("\n=== Build Command ===");
const built1 = buildCommand("git", ["commit", "-m", "Initial commit"]);
console.log("Built:", built1);

const built2 = buildCommand("echo", ["hello world", "test"]);
console.log("Built with spaces:", built2);

// Example 3: Parse environment variables
console.log("\n=== Parse Environment ===");
const env = parseEnv({ NODE_ENV: "production", CUSTOM: "value" });
console.log("Environment keys:", Object.keys(env).slice(0, 5));
console.log("NODE_ENV:", env["NODE_ENV"]);
console.log("CUSTOM:", env["CUSTOM"]);

// Example 4: Normalize options
console.log("\n=== Normalize Options ===");
const options1 = normalizeOptions({});
console.log("Default options:", {
	encoding: options1.encoding,
	stripFinalNewline: options1.stripFinalNewline,
	preferLocal: options1.preferLocal,
});

const options2 = normalizeOptions({
	encoding: "base64",
	verbose: true,
	dryRun: true,
});
console.log("Custom options:", {
	encoding: options2.encoding,
	verbose: options2.verbose,
	dryRun: options2.dryRun,
});

// Example 5: Strip final newline
console.log("\n=== Strip Final Newline ===");
const text1 = "hello world\n";
const text2 = "hello\nworld\n";
console.log("Original:", JSON.stringify(text1));
console.log("Stripped:", JSON.stringify(stripFinalNewline(text1)));
console.log("Original:", JSON.stringify(text2));
console.log("Stripped:", JSON.stringify(stripFinalNewline(text2)));

// Example 6: Get local bin path
console.log("\n=== Local Bin Path ===");
const binPath = getLocalBinPath();
console.log("Local bin path:", binPath);

// Example 7: Build PATH with local binaries
console.log("\n=== Build PATH ===");
const path1 = buildPath({ preferLocal: true, cwd: "/project" });
console.log("PATH with local bins:", path1.split(":")[0]);

const path2 = buildPath({ preferLocal: false });
console.log("PATH without local bins:", path2 === process.env["PATH"]);
