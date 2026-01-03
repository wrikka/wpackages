import { isOk } from "../types/result";
import { execute } from "./execute";
import { bash, cmd, createTemplate, ps, sh } from "./template";

// Example 1: Simple command template
console.log("=== Simple Command Template ===");
const simple = cmd`echo Hello, World!`;
console.log("Command:", simple);

const result1 = await execute(simple);
if (isOk(result1)) {
	console.log("Output:", result1.value.stdout);
}

// Example 2: Template with interpolation
console.log("\n=== Template with Interpolation ===");
const name = "Alice";
const greeting = cmd`echo Hello, ${name}!`;
console.log("Command:", greeting);

// Example 3: Shell command
console.log("\n=== Shell Command ===");
const shellCmd = sh`ls -la | head -n 5`;
console.log("Shell command:", shellCmd);

// Example 4: PowerShell command (Windows)
if (process.platform === "win32") {
	console.log("\n=== PowerShell Command ===");
	const processName = "node";
	const psCmd = ps`Get-Process ${processName}`;
	console.log("PowerShell command:", psCmd);
}

// Example 5: Bash command (Unix)
if (process.platform !== "win32") {
	console.log("\n=== Bash Command ===");
	const bashCmd = bash`echo $HOME`;
	console.log("Bash command:", bashCmd);
}

// Example 6: Reusable template
console.log("\n=== Reusable Template ===");
const gitCommit = createTemplate("git commit -m {message}");

const commit1 = gitCommit({ message: "feat: add new feature" });
const commit2 = gitCommit({ message: "fix: resolve bug" });

console.log("Commit 1:", commit1);
console.log("Commit 2:", commit2);

// Example 7: Docker template
console.log("\n=== Docker Template ===");
const dockerRun = createTemplate("docker run -p {port}:{port} -d {image}");

const nginx = dockerRun({ port: "8080", image: "nginx:latest" });
const redis = dockerRun({ port: "6379", image: "redis:alpine" });

console.log("Nginx:", nginx);
console.log("Redis:", redis);

// Example 8: npm scripts template
console.log("\n=== NPM Template ===");
const npmScript = createTemplate("npm run {script} -- {args}");

const buildProd = npmScript({ script: "build", args: "--mode production" });
const testWatch = npmScript({ script: "test", args: "--watch" });

console.log("Build prod:", buildProd);
console.log("Test watch:", testWatch);

// Example 9: Git operations
console.log("\n=== Git Operations ===");
const branch = "main";
const remote = "origin";

const gitPush = cmd`git push ${remote} ${branch}`;
const gitPull = cmd`git pull ${remote} ${branch}`;
const gitCheckout = cmd`git checkout ${branch}`;

console.log("Git push:", gitPush);
console.log("Git pull:", gitPull);
console.log("Git checkout:", gitCheckout);

// Example 10: Dynamic commands with variables
console.log("\n=== Dynamic Commands ===");
const commands = ["status", "log", "diff"];

for (const command of commands) {
	const gitCmd = cmd`git ${command}`;
	console.log(`Git ${command}:`, gitCmd);
}
