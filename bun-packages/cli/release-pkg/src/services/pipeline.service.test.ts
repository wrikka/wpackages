import { describe, expect, it, vi } from "vitest";
import type { Plugin, ReleaseContext } from "../types";
import { PipelineService } from "./pipeline.service";

const createMockContext = (): ReleaseContext => ({
	options: {},
	result: {},
	services: {},
	state: new Map(),
});

describe("PipelineService", () => {
	it("should register plugins and execute hooks in order", async () => {
		const callOrder: string[] = [];
		const hookFn1 = vi.fn(() => {
			callOrder.push("fn1");
		});
		const hookFn2 = vi.fn(() => {
			callOrder.push("fn2");
		});

		const plugin: Plugin = {
			name: "test-plugin",
			hooks: {
				start: [hookFn1, hookFn2],
			},
		};

		const pipeline = new PipelineService([plugin]);
		const context = createMockContext();

		await pipeline.executeHook("start", context);

		expect(hookFn1).toHaveBeenCalledWith(context);
		expect(hookFn2).toHaveBeenCalledWith(context);
		expect(callOrder).toEqual(["fn1", "fn2"]);
	});

	it("should handle multiple plugins for the same hook", async () => {
		const plugin1Hook = vi.fn();
		const plugin2Hook = vi.fn();

		const plugin1: Plugin = { name: "plugin1", hooks: { start: plugin1Hook } };
		const plugin2: Plugin = { name: "plugin2", hooks: { start: plugin2Hook } };

		const pipeline = new PipelineService([plugin1, plugin2]);
		const context = createMockContext();

		await pipeline.executeHook("start", context);

		expect(plugin1Hook).toHaveBeenCalledOnce();
		expect(plugin2Hook).toHaveBeenCalledOnce();
	});

	it("should not throw if a hook has no registered functions", async () => {
		const pipeline = new PipelineService([]);
		const context = createMockContext();

		await expect(pipeline.executeHook("start", context)).resolves.toBeUndefined();
	});
});
