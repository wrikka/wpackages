/**
 * ตัวอย่างการใช้งาน buildInstallArgs
 *
 * Run: bun run packages/dependencies/src/utils/command-builder.util.usage.ts
 */

import { buildInstallArgs } from "./command-builder.util";

// Example: Build install args for bun with frozen lockfile
const args = buildInstallArgs("bun", {
	cwd: "/project",
	frozen: true,
	production: false,
});

console.log("Install args:", args);
// Output: ["install", "--frozen-lockfile"]
