import type { Result } from "./types";
import type { Workflow, WorkflowContext, WorkflowError, WorkflowStep } from "./types";
import { workflowError } from "./creators";
import { ok, err } from "./result";

/**
 * Execute a workflow
 */
export async function executeWorkflow<E = Error>(
	workflow: Workflow<E>,
	log: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void; success: (msg: string) => void },
): Promise<Result<WorkflowError, WorkflowContext>> {
	log.info(`Executing workflow '${workflow.id}' (${workflow.name}).`);
	const context: WorkflowContext = new Map<string, any>();
	const executed = new Set<string>();
	const rollbacks: Array<() => Promise<void>> = [];

	try {
		if (workflow.parallel) {
			// Execute independent steps in parallel
			return await executeParallel(workflow, context, executed, rollbacks, log);
		}
		// Execute steps sequentially
		return await executeSequential(workflow, context, executed, rollbacks, log);
	} catch (error) {
		// Rollback if transactional
		if (workflow.transactional) {
			log.warn(`Workflow '${workflow.id}' failed. Starting rollback.`);
			await rollbackWorkflow(rollbacks, log);
		}
		log.error(`Workflow '${workflow.id}' execution failed.`);
		return err(
			workflowError("Workflow execution failed", {
				workflowId: workflow.id,
				code: "EXECUTION_FAILED",
				cause: error as Error,
			}),
		);
	}
}

/**
 * Execute workflow steps sequentially
 */
async function executeSequential<E = Error>(
	workflow: Workflow<E>,
	context: WorkflowContext,
	executed: Set<string>,
	rollbacks: Array<() => Promise<void>>,
	log: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void; success: (msg: string) => void },
): Promise<Result<WorkflowError, WorkflowContext>> {
	for (const step of workflow.steps) {
		// Check dependencies
		const depsReady = (step.dependsOn ?? []).every((dep) => executed.has(dep));
		if (!depsReady) {
			return err(
				workflowError("Step dependencies not met", {
					workflowId: workflow.id,
					stepId: step.id,
					code: "DEPS_NOT_MET",
					metadata: {
						step: step.name,
						dependsOn: step.dependsOn,
						executed: Array.from(executed),
					},
				}),
			);
		}

		// Execute step
		log.info(`Executing step '${step.id}' (${step.name}) in workflow '${workflow.id}'.`);
		const input = step.input ? step.input(context) : undefined;
		const result = await step.task.execute(input);
		if (result._tag === "Failure") {
			log.error(`Step '${step.id}' failed in workflow '${workflow.id}'.`);
			if (step.onError) step.onError(result.error as E);
			return err(
				workflowError("Step execution failed", {
					workflowId: workflow.id,
					stepId: step.id,
					code: "STEP_FAILED",
					metadata: { step: step.name, error: result.error as any },
				}),
			);
		}

		// Store result and mark as executed
		context.set(step.id, result.value);
		executed.add(step.id);

		// Store rollback function if available
		if (step.rollback) {
			rollbacks.push(step.rollback);
		}

		log.success(`Step '${step.id}' executed successfully.`);

		// Call success handler
		if (step.onSuccess) step.onSuccess(result.value);
	}

	return ok(context);
}

/**
 * Execute workflow steps in parallel where possible
 */
async function executeParallel<E = Error>(
	workflow: Workflow<E>,
	context: WorkflowContext,
	executed: Set<string>,
	rollbacks: Array<() => Promise<void>>,
	log: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void; success: (msg: string) => void },
): Promise<Result<WorkflowError, WorkflowContext>> {
	log.info(`Executing parallel steps for workflow '${workflow.id}'.`);
	const remaining = new Set(workflow.steps.map((s) => s.id));

	while (remaining.size > 0) {
		// Find steps that can be executed (dependencies met)
		const ready = workflow.steps.filter((step) => {
			if (!remaining.has(step.id)) return false;
			const depsReady = (step.dependsOn ?? []).every((dep) => executed.has(dep));
			return depsReady;
		});

		if (ready.length === 0) {
			return err(
				workflowError("Circular dependency detected", {
					workflowId: workflow.id,
					code: "CIRCULAR_DEPENDENCY",
					metadata: {
						remaining: Array.from(remaining),
						executed: Array.from(executed),
					},
				}),
			);
		}

		// Execute ready steps in parallel
		const stepResults = await Promise.all(
			ready.map(async (step) => {
				const input = step.input ? step.input(context) : undefined;
				const result: Result<any, E> = await step.task.execute(input);
				return { step, result };
			}),
		);

		// Process results
		for (const { step, result } of stepResults) {
			if (result._tag === "Failure") {
				if (step.onError) step.onError(result.error as E);
				return err(
					workflowError("Step execution failed", {
						workflowId: workflow.id,
						stepId: step.id,
						code: "STEP_FAILED",
						metadata: { step: step.name, error: result.error as any },
					}),
				);
			}

			context.set(step.id, result.value);
			executed.add(step.id);
			remaining.delete(step.id);

			if (step.rollback) {
				rollbacks.push(step.rollback);
			}

			if (step.onSuccess) step.onSuccess(result.value);
		}
	}

	return ok(context);
}

/**
 * Rollback workflow
 */
async function rollbackWorkflow(
	rollbacks: Array<() => Promise<void>>,
	log: { info: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void; success: (msg: string) => void },
): Promise<void> {
	// Execute rollbacks in reverse order
	for (const rollback of rollbacks.reverse()) {
		try {
			await rollback();
		} catch (error) {
			log.error(`Rollback failed: ${error}`);
		}
	}
}

/**
 * Create a simple workflow
 */
export function createWorkflow<E = Error>(
	name: string,
	steps: WorkflowStep<any, any, E>[],
	options?: {
		id?: string;
		parallel?: boolean;
		transactional?: boolean;
	},
): Workflow<E> {
	return {
		id: options?.id ?? crypto.randomUUID(),
		name,
		steps,
		parallel: options?.parallel ?? false,
		transactional: options?.transactional ?? false,
	};
}

/**
 * Validate workflow (check for circular dependencies)
 */
export function validateWorkflow<E = Error>(
	workflow: Workflow<E>,
): Result<WorkflowError, true> {
	const stepIds = new Set(workflow.steps.map((s) => s.id));

	for (const step of workflow.steps) {
		// Check if all dependencies exist
		for (const dep of step.dependsOn ?? []) {
			if (!stepIds.has(dep)) {
				return err(
					workflowError("Invalid dependency", {
						workflowId: workflow.id,
						stepId: step.id,
						code: "INVALID_DEPENDENCY",
						metadata: {
							step: step.name,
							dependency: dep,
						},
					}),
				);
			}
		}
	}

	// Check for circular dependencies using DFS
	const visited = new Set<string>();
	const recursionStack = new Set<string>();

	function hasCycle(stepId: string): boolean {
		visited.add(stepId);
		recursionStack.add(stepId);

		const step = workflow.steps.find((s) => s.id === stepId);
		if (!step) return false;

		for (const dep of step.dependsOn ?? []) {
			if (!visited.has(dep)) {
				if (hasCycle(dep)) return true;
			} else if (recursionStack.has(dep)) {
				return true;
			}
		}

		recursionStack.delete(stepId);
		return false;
	}

	for (const step of workflow.steps) {
		if (!visited.has(step.id)) {
			if (hasCycle(step.id)) {
				return err(
					workflowError("Circular dependency detected", {
						workflowId: workflow.id,
						code: "CIRCULAR_DEPENDENCY",
					}),
				);
			}
		}
	}

	return ok(true);
}
