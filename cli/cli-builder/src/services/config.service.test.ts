import * as configManager from "@wpackages/config-manager";
import { Effect } from "effect";
import * as findUp from "find-up";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadCliConfig } from "./config.service";

vi.spyOn(globalThis, "Bun", "get").mockReturnValue({ file: vi.fn() } as any);

// Mock dependencies
vi.mock("@wpackages/config-manager", () => ({
	loadConfig: vi.fn(),
}));

vi.mock("find-up", () => ({
	findUp: vi.fn(),
}));

describe("loadCliConfig", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should load default config when no package.json is found", async () => {
		vi.spyOn(findUp, "findUp").mockResolvedValue(undefined);
		vi.spyOn(configManager, "loadConfig").mockResolvedValue({
			config: { name: "my-cli", version: "0.0.1", commands: [] },
		});

		const result = await Effect.runPromise(loadCliConfig());

		expect(result.name).toBe("my-cli");
		expect(configManager.loadConfig).toHaveBeenCalledWith(expect.objectContaining({ name: "my-cli" }));
	});

	it("should derive config name from package.json", async () => {
		vi.spyOn(findUp, "findUp").mockResolvedValue("/fake/path/package.json");
		vi.spyOn(Bun as any, "file").mockReturnValue({ json: () => Promise.resolve({ name: "@scoped/my-awesome-cli" }) });
		vi.spyOn(configManager, "loadConfig").mockResolvedValue({
			config: { name: "my-awesome-cli", version: "1.2.3", commands: [] },
		});

		const result = await Effect.runPromise(loadCliConfig());

		expect(result.name).toBe("my-awesome-cli");
		expect(configManager.loadConfig).toHaveBeenCalledWith(expect.objectContaining({ name: "my-awesome-cli" }));
	});
});
