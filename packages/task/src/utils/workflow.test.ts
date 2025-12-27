import { describe, expect, it } from "vitest";
import { createWorkflow, executeWorkflow, validateWorkflow } from "../services/workflow";
import { createTask } from "../utils/creators";

describe("Workflow Operations", () => {
	it("should create a workflow", () => {
		const task = createTask("test-task", async () => ({ _tag: "Success", value: "result" }));
		const workflow = createWorkflow("test-workflow", [
			{
				id: "step-1",
				name: "Step 1",
				task,
			},
		]);

		expect(workflow.name).toBe("test-workflow");
		expect(workflow.steps.length).toBe(1);
		expect(workflow.parallel).toBe(false);
		expect(workflow.transactional).toBe(false);
	});

	it("should create a workflow with custom options", () => {
		const task = createTask("test-task", async () => ({ _tag: "Success", value: "result" }));
		const workflow = createWorkflow(
			"test-workflow",
			[
				{
					id: "step-1",
					name: "Step 1",
					task,
				},
			],
			{
				id: "custom-id",
				parallel: true,
				transactional: true,
			},
		);

		expect(workflow.id).toBe("custom-id");
		expect(workflow.parallel).toBe(true);
		expect(workflow.transactional).toBe(true);
	});

	it("should validate a valid workflow", () => {
		const task = createTask("test-task", async () => ({ _tag: "Success", value: "result" }));
		const workflow = createWorkflow("test-workflow", [
			{
				id: "step-1",
				name: "Step 1",
				task,
			},
		]);

		const result = validateWorkflow(workflow);
		expect(result._tag).toBe("Success");
	});

	it("should detect invalid dependencies", () => {
		const task = createTask("test-task", async () => ({ _tag: "Success", value: "result" }));
		const workflow = createWorkflow("test-workflow", [
			{
				id: "step-1",
				name: "Step 1",
				task,
				dependsOn: ["non-existent-step"],
			},
		]);

		const result = validateWorkflow(workflow);
		expect(result._tag).toBe("Failure");
	});

	it("should execute a simple workflow sequentially", async () => {
		const task = createTask("test-task", async () => ({ _tag: "Success", value: "result" }));
		const workflow = createWorkflow("test-workflow", [
			{
				id: "step-1",
				name: "Step 1",
				task,
			},
		]);

		const result = await executeWorkflow(workflow);
		expect(result._tag).toBe("Success");
		expect(result._tag === "Success" ? result.value.get("step-1") : undefined).toBe("result");
	});

	it("should execute a workflow with dependencies", async () => {
		const task1 = createTask("task-1", async () => ({ _tag: "Success", value: "result-1" }));
		const task2 = createTask("task-2", async (input: string) => ({
			_tag: "Success",
			value: `${input}-result-2`,
		}));

		const workflow = createWorkflow("test-workflow", [
			{
				id: "step-1",
				name: "Step 1",
				task: task1,
			},
			{
				id: "step-2",
				name: "Step 2",
				task: task2,
				dependsOn: ["step-1"],
				input: (context) => context.get("step-1"),
			},
		]);

		const result = await executeWorkflow(workflow);
		expect(result._tag).toBe("Success");
		expect(result._tag === "Success" ? result.value.get("step-1") : undefined).toBe("result-1");
		expect(result._tag === "Success" ? result.value.get("step-2") : undefined).toBe("result-1-result-2");
	});
});
