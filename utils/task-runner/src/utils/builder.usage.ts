import { isOk } from "../types/result";
import { bun, command, docker, git, npm } from "./builder";

// Example 1: Basic command builder
console.log("=== Basic Command Builder ===");
const echo = command("echo", "Hello, World!").build();
console.log("Echo command:", echo);

// Example 2: Fluent API chaining
console.log("\n=== Fluent API Chaining ===");
const npmInstall = npm("install")
	.cwd("/project")
	.env({ NODE_ENV: "production" })
	.timeout(30000)
	.verbose()
	.build();

console.log("NPM install:", npmInstall);

// Example 3: Git commands
console.log("\n=== Git Commands ===");
const gitStatus = git("status").args("--short").build();
const gitCommit = git("commit").args("-m", "feat: add new feature").build();
const gitPush = git("push").args("origin", "main").build();

console.log("Git status:", gitStatus);
console.log("Git commit:", gitCommit);
console.log("Git push:", gitPush);

// Example 4: Execute directly
console.log("\n=== Execute Directly ===");
const result = await command("echo", "test").run();
if (isOk(result)) {
	console.log("Output:", result.value.stdout);
}

// Example 5: Docker commands
console.log("\n=== Docker Commands ===");
const dockerPs = docker("ps").args("-a").build();
const dockerRun = docker("run")
	.args("-p", "3000:3000")
	.args("-d")
	.args("nginx")
	.build();

console.log("Docker ps:", dockerPs);
console.log("Docker run:", dockerRun);

// Example 6: Bun commands
console.log("\n=== Bun Commands ===");
const bunInstall = bun("install").preferLocal().build();
const bunTest = bun("test").verbose().build();

console.log("Bun install:", bunInstall);
console.log("Bun test:", bunTest);

// Example 7: Clone and modify
console.log("\n=== Clone and Modify ===");
const baseGit = git("status").cwd("/repo");
const fullStatus = baseGit.clone();
const shortStatus = baseGit.clone().args("--short");

console.log("Full status:", fullStatus.build());
console.log("Short status:", shortStatus.build());

// Example 8: Environment variables
console.log("\n=== Environment Variables ===");
const withEnv = command("node", "script.js")
	.addEnv("DEBUG", "true")
	.addEnv("LOG_LEVEL", "verbose")
	.env({ PORT: "3000", HOST: "localhost" })
	.build();

console.log("With env:", withEnv);

// Example 9: Dry run mode
console.log("\n=== Dry Run Mode ===");
const dryRun = command("rm", "-rf", "/").dryRun().build();
console.log("Dry run:", dryRun);

// Example 10: Complex pipeline
console.log("\n=== Complex Pipeline ===");
const deploy = docker("run")
	.args("-p", "8080:80")
	.args("-d")
	.args("--name", "my-app")
	.args("--restart", "unless-stopped")
	.env({ NODE_ENV: "production" })
	.args("my-image:latest")
	.timeout(60000)
	.verbose()
	.build();

console.log("Deploy:", deploy);

// Example 11: Abort signal
console.log("\n=== With Abort Signal ===");
const controller = new AbortController();
const longRunning = command("sleep", "10").signal(controller.signal).build();

console.log("Long running with signal:", longRunning);

// Example 12: Reusable builders
console.log("\n=== Reusable Builders ===");
const gitInRepo = git("").cwd("/my-repo");

const status = gitInRepo.clone().args("status").build();
const log = gitInRepo.clone().args("log", "--oneline").build();
const diff = gitInRepo.clone().args("diff").build();

console.log("Status:", status);
console.log("Log:", log);
console.log("Diff:", diff);
