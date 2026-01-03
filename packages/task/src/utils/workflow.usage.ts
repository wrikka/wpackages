/**
 * ตัวอย่างการใช้งาน createWorkflow
 *
 * Run: bun run packages/task/src/utils/workflow.usage.ts
 */

import { createWorkflow, executeWorkflow } from "../services/workflow";
import type { WorkflowContext, WorkflowStep } from "../types";
import { createTask } from "./creators";

// Helper for creating simple tasks that log their execution
const simpleTask = (name: string, delay: number, shouldFail = false) => {
	return createTask(name, async (input: any) => {
		console.log(` -> [${name}] START with input:`, input);
		await new Promise(resolve => setTimeout(resolve, delay));
		if (shouldFail) {
			console.log(` -> [${name}] FAIL`);
			return { _tag: "Failure", error: new Error(`${name} failed`) };
		}
		const output = `Output from ${name}`;
		console.log(` -> [${name}] SUCCESS with output: "${output}"`);
		return { _tag: "Success", value: output };
	});
};

// --- Define Tasks ---
const taskA = simpleTask("Task A", 200);
const taskB = simpleTask("Task B", 300);
const taskC = simpleTask("Task C", 100);
const failingTaskD = simpleTask("Task D (Fails)", 150, true);

// --- Define Workflow Steps ---
const step1: WorkflowStep = {
	id: "step1",
	name: "Step 1: Run Task A",
	task: taskA,
	rollback: async () => console.log("<- [Step 1] ROLLBACK executed."),
};

const step2: WorkflowStep = {
	id: "step2",
	name: "Step 2: Run Task B (depends on Step 1)",
	task: taskB,
	dependsOn: ["step1"],
	input: (context: WorkflowContext) => ({ from: "step1", data: context.get("step1") }),
	rollback: async () => console.log("<- [Step 2] ROLLBACK executed."),
};

const step3: WorkflowStep = {
	id: "step3",
	name: "Step 3: Run Task C",
	task: taskC,
};

const step4Failing: WorkflowStep = {
	id: "step4",
	name: "Step 4: Run Failing Task D (depends on Step 2)",
	task: failingTaskD,
	dependsOn: ["step2"],
	rollback: async () => console.log("<- [Step 4] ROLLBACK executed (should not happen)."),
};

async function main() {
	// --- Example 1: Successful Sequential Workflow ---
	console.log("--- 1. Running Successful Sequential Workflow ---");
	const sequentialWorkflow = createWorkflow("Sequential Workflow", [step1, step2]);
	const seqResult = await executeWorkflow(sequentialWorkflow);
	if (seqResult._tag === "Success") {
		console.log("Sequential workflow SUCCESS. Final context:", Object.fromEntries(seqResult.value));
	} else {
		console.error("Sequential workflow FAILED:", seqResult.error);
	}

	// --- Example 2: Successful Parallel Workflow ---
	console.log("\n--- 2. Running Successful Parallel Workflow ---");
	const parallelWorkflow = createWorkflow("Parallel Workflow", [step1, step3], { parallel: true });
	const paraResult = await executeWorkflow(parallelWorkflow);
	if (paraResult._tag === "Success") {
		console.log("Parallel workflow SUCCESS. Final context:", Object.fromEntries(paraResult.value));
	} else {
		console.error("Parallel workflow FAILED:", paraResult.error);
	}

	// --- Example 3: Failing Transactional Workflow (to demonstrate rollback) ---
	console.log("\n--- 3. Running Failing Transactional Workflow ---");
	const transactionalWorkflow = createWorkflow("Transactional Workflow", [step1, step2, step4Failing], {
		transactional: true,
	});
	const transResult = await executeWorkflow(transactionalWorkflow);
	if (transResult._tag === "Success") {
		console.log("Transactional workflow SUCCEEDED (this should not happen).");
	} else {
		console.error("Transactional workflow FAILED as expected:", transResult.error.message);
		console.log("Rollback should have been triggered for Step 1 and Step 2.");
	}
}

main();
