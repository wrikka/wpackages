import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { schedulerService } from "./scheduler.service";

describe("SchedulerService", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should schedule a task", async () => {
		const task = vi.fn();
		const config = { name: "test-task", enabled: true };

		await expect(schedulerService.scheduleTask(config, task)).resolves.toBeUndefined();
	});

	it("should prevent scheduling duplicate tasks", async () => {
		const task = vi.fn();
		const config = { name: "duplicate-task", enabled: true };

		// Schedule the first task
		await schedulerService.scheduleTask(config, task);

		// Try to schedule the same task again
		await expect(schedulerService.scheduleTask(config, task)).rejects.toThrow("already exists");
	});

	it("should list tasks", async () => {
		const task = vi.fn();
		const config = { name: "list-task", enabled: true };

		await schedulerService.scheduleTask(config, task);

		const tasks = await schedulerService.listTasks();

		expect(tasks).toContain("list-task");
	});

	it("should cancel a task", async () => {
		const task = vi.fn();
		const config = { name: "cancel-task", enabled: true };

		// Schedule a task
		await schedulerService.scheduleTask(config, task);

		// Cancel the task
		await expect(schedulerService.cancelTask("cancel-task")).resolves.toBeUndefined();
	});

	it("should fail to cancel a non-existent task", async () => {
		await expect(schedulerService.cancelTask("non-existent-task")).rejects.toThrow("not found");
	});
});
