import type { Transaction, Result } from "../types";
import { ok, err } from "../utils/result";

/**
 * Create a transaction
 */
export function createTransaction(
	steps: Array<{
		execute: () => Promise<void>;
		rollback: () => Promise<void>;
	}>,
): Transaction {
	return {
		id: crypto.randomUUID(),
		steps,
		status: "pending",
	};
}

/**
 * Execute a transaction
 */
export async function executeTransaction(
	transaction: Transaction,
): Promise<Result<Error, Transaction>> {
	const executedSteps: number[] = [];

	try {
		// Execute all steps
		for (let i = 0; i < transaction.steps.length; i++) {
			const step = transaction.steps[i];
			if (step) {
				await step.execute();
				executedSteps.push(i);
			}
		}

		return ok({
			...transaction,
			status: "committed",
		});
	} catch (error) {
		// Rollback executed steps in reverse order
		for (const index of executedSteps.reverse()) {
			try {
				const step = transaction.steps[index];
				if (step) {
					await step.rollback();
				}
			} catch (rollbackError) {
				console.error(`Rollback failed for step ${index}:`, rollbackError);
			}
		}

		return err(error as Error);
	}
}

/**
 * Rollback a transaction manually
 */
export async function rollbackTransaction(
	transaction: Transaction,
): Promise<Result<Error, Transaction>> {
	try {
		// Rollback all steps in reverse order
		for (let i = transaction.steps.length - 1; i >= 0; i--) {
			const step = transaction.steps[i];
			if (step) {
				await step.rollback();
			}
		}

		return ok({
			...transaction,
			status: "rolled-back",
		});
	} catch (error) {
		return err(error as Error);
	}
}
