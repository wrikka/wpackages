import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { generateRoutes, generateVirtualRoutesModuleCode } from "./index";

describe("wrouter/generateRoutes", () => {
	it("generates routes from pages dir", async () => {
		const root = await (async () => {
			const dir = join(tmpdir(), `wrouter-${Date.now()}`);
			await mkdir(join(dir, "pages"), { recursive: true });
			await writeFile(join(dir, "pages", "index.ts"), "export default 1;", "utf-8");
			await mkdir(join(dir, "pages", "nested"), { recursive: true });
			await writeFile(join(dir, "pages", "nested", "index.ts"), "export default 2;", "utf-8");
			return dir;
		})();

		const routes = generateRoutes({ pagesDir: join(root, "pages") });

		expect(routes.map((r) => r.path)).toEqual(["/", "/nested"]);
	});
});

describe("wrouter/virtual module", () => {
	it("generates a module that exports routes", () => {
		const code = generateVirtualRoutesModuleCode([
			{ name: "index", path: "/", file: "/abs/index.ts", params: [], methods: ["GET"] as const },
		]);
		expect(code).toContain("export const routes");
	});
});
