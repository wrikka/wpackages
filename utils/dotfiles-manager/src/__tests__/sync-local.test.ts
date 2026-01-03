import * as fs from "node:fs";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { syncToLocal } from "../cli/sync-local";
import { ConfigService } from "../lib/config";
import { ScriptRunnerService, TemplateService } from "../services";

// Mock dependencies
vi.mock("../lib/config", () => ({
	ConfigService: {
		load: vi.fn(),
		save: vi.fn(),
	},
}));
vi.mock("../services", () => ({
	ScriptRunnerService: {
		run: vi.fn(),
	},
	TemplateService: {
		render: vi.fn(),
	},
}));
vi.mock("node:fs", () => ({
	existsSync: vi.fn(),
	readFileSync: vi.fn(),
	writeFileSync: vi.fn(),
	symlinkSync: vi.fn(),
	unlinkSync: vi.fn(),
}));
vi.mock("@clack/prompts", () => ({
	intro: vi.fn(),
	outro: vi.fn(),
	note: vi.fn(),
	spinner: vi.fn(() => ({ start: vi.fn(), stop: vi.fn() })),
}));

describe("syncToLocal", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("should sync files in copy mode", async () => {
		const mockConfig = {
			files: [{ source: "/home/user/.bashrc", target: "/dotfiles/.bashrc" }],
			mode: "copy",
			templateData: { user: "test" },
		};
		(ConfigService.load as vi.Mock).mockResolvedValue(mockConfig as any);
		(fs.existsSync as vi.Mock).mockReturnValue(true);
		(fs.readFileSync as vi.Mock).mockReturnValue("Hello {{user}}");
		(TemplateService.render as vi.Mock).mockReturnValue("Hello test");

		await syncToLocal({});

		expect(fs.writeFileSync).toHaveBeenCalledWith("/home/user/.bashrc", "Hello test");
	});

	it("should sync files in symlink mode", async () => {
		const mockConfig = {
			files: [{ source: "/home/user/.gitconfig", target: "/dotfiles/.gitconfig" }],
			mode: "symlink",
		};
		(ConfigService.load as vi.Mock).mockResolvedValue(mockConfig as any);
		(fs.existsSync as vi.Mock).mockReturnValue(true);

		await syncToLocal({});

		expect(fs.symlinkSync).toHaveBeenCalledWith("/dotfiles/.gitconfig", "/home/user/.gitconfig");
	});

	it("should perform a dry run without changing files", async () => {
		const mockConfig = {
			files: [{ source: "/home/user/.zshrc", target: "/dotfiles/.zshrc" }],
			mode: "copy",
		};
		(ConfigService.load as vi.Mock).mockResolvedValue(mockConfig as any);
		(fs.existsSync as vi.Mock).mockReturnValue(true);

		await syncToLocal({ dryRun: true });

		expect(fs.writeFileSync).not.toHaveBeenCalled();
		expect(fs.symlinkSync).not.toHaveBeenCalled();
	});

	it("should run before and after scripts", async () => {
		const mockConfig = {
			files: [],
			mode: "copy",
			scripts: { before: ["echo \"before\""], after: ["echo \"after\""] },
		};
		(ConfigService.load as vi.Mock).mockResolvedValue(mockConfig as any);
		(ScriptRunnerService.run as vi.Mock).mockResolvedValue(undefined);

		await syncToLocal({});

		expect(ScriptRunnerService.run).toHaveBeenCalledWith(["echo \"before\""]);
		expect(ScriptRunnerService.run).toHaveBeenCalledWith(["echo \"after\""]);
	});
});
