import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Plugin, ReleaseOptions } from "../types";
import { release } from "./release.service";

vi.mock("./index", () => {
	class MockGitService {
		isGitRepository = vi.fn().mockResolvedValue(true);
		hasUncommittedChanges = vi.fn().mockResolvedValue(false);
		hasRemote = vi.fn().mockResolvedValue(true);
		commit = vi.fn().mockResolvedValue(undefined);
		tag = vi.fn().mockResolvedValue(undefined);
		push = vi.fn().mockResolvedValue(undefined);
		getLastTag = vi.fn().mockResolvedValue("v1.0.0");
		getCommits = vi.fn().mockResolvedValue([]);
	}

	class MockVersionService {
		getPackageInfo = vi.fn().mockResolvedValue({ name: "test-pkg", version: "1.0.0" });
		bumpVersion = vi.fn().mockResolvedValue({ from: "1.0.0", to: "1.0.1", type: "patch" });
		updatePackageJson = vi.fn().mockResolvedValue(undefined);
	}

	class MockChangelogService {
		generate = vi.fn().mockResolvedValue("changelog content");
		update = vi.fn().mockResolvedValue(undefined);
	}

	class MockPublishService {
		isPublished = vi.fn().mockResolvedValue(false);
		publish = vi.fn().mockResolvedValue(undefined);
	}

	class MockMonorepoService {
		isMonorepo = vi.fn().mockResolvedValue(false);
		getPackages = vi.fn().mockResolvedValue([]);
		getChangedPackages = vi.fn().mockResolvedValue([]);
	}

	return {
		ChangelogService: MockChangelogService,
		GitService: MockGitService,
		MonorepoService: MockMonorepoService,
		PublishService: MockPublishService,
		VersionService: MockVersionService,
	};
});

describe("release service (Orchestrator)", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should run the full release workflow correctly", async () => {
		const options: Partial<ReleaseOptions> = { type: "patch" };
		const result = await release(options);

		expect(result.success).toBe(true);
		expect(result.version).toBe("1.0.1");
		expect(mockVersionService.updatePackageJson).toHaveBeenCalledWith("1.0.1");
		expect(mockChangelogService.update).toHaveBeenCalled();
		expect(mockGitService.commit).toHaveBeenCalled();
		expect(mockPublishService.publish).toHaveBeenCalled();
	});

	it("should execute plugin hooks at each lifecycle stage", async () => {
		const hookFn = vi.fn();
		const testPlugin: Plugin = {
			name: "test-plugin",
			hooks: {
				"before:validate": hookFn,
				"after:bumpVersion": hookFn,
				"before:publish": hookFn,
			},
		};

		await release({ type: "patch", plugins: [testPlugin] });

		expect(hookFn).toHaveBeenCalledTimes(3);
	});

	it("should use a custom changelog renderer if provided", async () => {
		const customRenderer = vi.fn().mockReturnValue("custom changelog");
		await release({ type: "patch", changelog: customRenderer });

		expect(mockChangelogService.generate).toHaveBeenCalledWith(
			"1.0.1",
			expect.any(Array),
			customRenderer,
		);
	});

	it("should respect the dryRun option and not make changes", async () => {
		const result = await release({ type: "patch", dryRun: true });

		expect(result.success).toBe(true);
		expect(result.version).toBe("1.0.1");
		expect(mockVersionService.updatePackageJson).not.toHaveBeenCalled();
		expect(mockGitService.commit).not.toHaveBeenCalled();
		expect(mockPublishService.publish).not.toHaveBeenCalled();
	});
});
