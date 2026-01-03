import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { VersionService } from "./version.service";

// Mock fs/promises
vi.mock("node:fs/promises", () => ({
	readFile: vi.fn(),
	writeFile: vi.fn(),
}));

import { readFile, writeFile } from "node:fs/promises";

const mockReadFile = readFile as Mock;
const mockWriteFile = writeFile as Mock;

describe("VersionService", () => {
	let service: VersionService;

	beforeEach(() => {
		service = new VersionService();
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("getCurrentVersion", () => {
		it("should return version from package.json", async () => {
			mockReadFile.mockResolvedValue(JSON.stringify({ version: "1.2.3" }));

			const version = await service.getCurrentVersion();
			expect(version).toBe("1.2.3");
		});

		it("should return 0.0.0 if version is missing", async () => {
			mockReadFile.mockResolvedValue(JSON.stringify({}));

			const version = await service.getCurrentVersion();
			expect(version).toBe("0.0.0");
		});

		it("should throw on invalid version", async () => {
			mockReadFile.mockResolvedValue(
				JSON.stringify({ version: "not-a-version" }),
			);

			await expect(service.getCurrentVersion()).rejects.toThrow(
				"Invalid version",
			);
		});

		it("should throw on read error", async () => {
			mockReadFile.mockRejectedValue(new Error("File not found"));

			await expect(service.getCurrentVersion()).rejects.toThrow(
				"Failed to read package.json",
			);
		});
	});

	describe("bumpVersion", () => {
		beforeEach(() => {
			mockReadFile.mockResolvedValue(JSON.stringify({ version: "1.0.0" }));
		});

		it("should bump major version", async () => {
			const result = await service.bumpVersion("major");
			expect(result).toEqual({
				from: "1.0.0",
				to: "2.0.0",
				type: "major",
			});
		});

		it("should bump minor version", async () => {
			const result = await service.bumpVersion("minor");
			expect(result).toEqual({
				from: "1.0.0",
				to: "1.1.0",
				type: "minor",
			});
		});

		it("should bump patch version", async () => {
			const result = await service.bumpVersion("patch");
			expect(result).toEqual({
				from: "1.0.0",
				to: "1.0.1",
				type: "patch",
			});
		});

		it("should create prerelease with custom preid", async () => {
			const result = await service.bumpVersion("prepatch", "alpha");
			expect(result).toEqual({
				from: "1.0.0",
				to: "1.0.1-alpha.0",
				type: "prepatch",
			});
		});
	});

	describe("updatePackageJson", () => {
		it("should update package.json with new version", async () => {
			const packageJson = { name: "test", version: "1.0.0" };
			mockReadFile.mockResolvedValue(JSON.stringify(packageJson));

			await service.updatePackageJson("2.0.0");

			expect(mockWriteFile).toHaveBeenCalledWith(
				expect.stringContaining("package.json"),
				expect.stringContaining("\"version\": \"2.0.0\""),
			);
		});

		it("should throw on invalid version", async () => {
			await expect(
				service.updatePackageJson("not-a-version"),
			).rejects.toThrow("Invalid version");
		});

		it("should throw on write error", async () => {
			mockReadFile.mockResolvedValue(JSON.stringify({ version: "1.0.0" }));
			mockWriteFile.mockRejectedValue(new Error("Write failed"));

			await expect(service.updatePackageJson("2.0.0")).rejects.toThrow(
				"Failed to update package.json",
			);
		});
	});

	describe("getPackageInfo", () => {
		it("should return package name and version", async () => {
			mockReadFile.mockResolvedValue(
				JSON.stringify({ name: "test-package", version: "1.0.0" }),
			);

			const info = await service.getPackageInfo();
			expect(info).toEqual({ name: "test-package", version: "1.0.0" });
		});

		it("should throw if name is missing", async () => {
			mockReadFile.mockResolvedValue(JSON.stringify({ version: "1.0.0" }));

			await expect(service.getPackageInfo()).rejects.toThrow(
				"missing 'name' field",
			);
		});

		it("should handle missing version", async () => {
			mockReadFile.mockResolvedValue(JSON.stringify({ name: "test" }));

			const info = await service.getPackageInfo();
			expect(info.version).toBe("0.0.0");
		});
	});
});
