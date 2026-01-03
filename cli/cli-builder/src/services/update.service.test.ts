import boxen from "boxen";
import { compareVersions } from "compare-versions";
import { Effect } from "effect";
import latestVersion from "latest-version";
import { afterEach, describe, expect, it, vi } from "vitest";
import { checkForUpdates } from "./update.service";

// Mock dependencies
vi.mock("latest-version", () => ({
	default: vi.fn(),
}));
vi.mock("compare-versions", () => ({
	compareVersions: vi.fn(),
}));
vi.mock("boxen", () => ({
	default: vi.fn(),
}));

describe("checkForUpdates", () => {
	const pkg = { name: "my-cli", version: "1.0.0" };

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should show an update message when a newer version is available", async () => {
		(latestVersion as vi.Mock).mockResolvedValue("1.1.0");
		(compareVersions as vi.Mock).mockReturnValue(1);
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		await Effect.runPromise(checkForUpdates(pkg));

		expect(latestVersion).toHaveBeenCalledWith(pkg.name);
		expect(compareVersions).toHaveBeenCalledWith("1.1.0", pkg.version);
		expect(boxen).toHaveBeenCalled();
		expect(consoleSpy).toHaveBeenCalled();
	});

	it("should not show an update message when the version is current", async () => {
		(latestVersion as vi.Mock).mockResolvedValue("1.0.0");
		(compareVersions as vi.Mock).mockReturnValue(0);
		const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

		await Effect.runPromise(checkForUpdates(pkg));

		expect(consoleSpy).not.toHaveBeenCalled();
	});

	it("should handle errors when the package is not found", async () => {
		(latestVersion as vi.Mock).mockResolvedValue(undefined as any);
		const promise = Effect.runPromise(checkForUpdates(pkg));
		await expect(promise).rejects.toThrow("Failed to check for updates: Error: Package not found on npm registry.");
	});
});
