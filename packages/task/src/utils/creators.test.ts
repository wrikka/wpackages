import { describe, expect, it } from "vitest";
import { createTask, taskError, scheduleError, queueError, workflowError } from "./creators";
import type { Schedule } from "../types";

describe("createTask", () => {
	it("should create a task with default values", () => {
		const task = createTask("test-task", async () => ({ _tag: "Success", value: "result" }));
		expect(task.name).toBe("test-task");
		expect(task.priority).toBe("normal");
		expect(task.retries).toBe(0);
		expect(task.id).toBeDefined();
	});

	it("should create a task with custom options", () => {
		const task = createTask(
			"test-task",
			async () => ({ _tag: "Success", value: "result" }),
			{
				id: "custom-id",
				priority: "high",
				timeout: 5000,
				retries: 3,
				metadata: { key: "value" },
			},
		);
		expect(task.id).toBe("custom-id");
		expect(task.priority).toBe("high");
		expect(task.timeout).toBe(5000);
		expect(task.retries).toBe(3);
		expect(task.metadata).toEqual({ key: "value" });
	});

	it("should execute task function", async () => {
		const task = createTask("test-task", async () => ({ _tag: "Success", value: "result" }));
		const result = await task.execute(undefined);
		expect(result._tag).toBe("Success");
		expect(result.value).toBe("result");
	});
});

describe("taskError", () => {
	it("should create a task error", () => {
		const error = taskError("Task failed", {
			taskId: "task-1",
			taskName: "my-task",
			code: "EXECUTION_ERROR",
		});
		expect(error.name).toBe("TaskError");
		expect(error.message).toBe("Task failed");
		expect(error.taskId).toBe("task-1");
		expect(error.taskName).toBe("my-task");
		expect(error.code).toBe("EXECUTION_ERROR");
	});
});

describe("scheduleError", () => {
	it("should create a schedule error", () => {
		const schedule: Schedule = { type: "cron", expression: "invalid" };
		const error = scheduleError("Invalid schedule", {
			schedule,
			code: "INVALID_SCHEDULE",
		});
		expect(error.name).toBe("ScheduleError");
		expect(error.message).toBe("Invalid schedule");
		expect(error.code).toBe("INVALID_SCHEDULE");
	});
});

describe("queueError", () => {
	it("should create a queue error", () => {
		const error = queueError("Queue is full", {
			queueName: "main",
			code: "QUEUE_FULL",
		});
		expect(error.name).toBe("QueueError");
		expect(error.message).toBe("Queue is full");
		expect(error.queueName).toBe("main");
		expect(error.code).toBe("QUEUE_FULL");
	});
});

describe("workflowError", () => {
	it("should create a workflow error", () => {
		const error = workflowError("Workflow failed", {
			workflowId: "wf-1",
			stepId: "step-1",
			code: "STEP_FAILED",
		});
		expect(error.name).toBe("WorkflowError");
		expect(error.message).toBe("Workflow failed");
		expect(error.workflowId).toBe("wf-1");
		expect(error.stepId).toBe("step-1");
		expect(error.code).toBe("STEP_FAILED");
	});
});
