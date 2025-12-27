import { describe, expect, it } from "vitest";
import { createTransaction, executeTransaction, rollbackTransaction } from "../services/transaction";

describe("Transaction Operations", () => {
	it("should create a transaction", () => {
		const steps = [
			{
				execute: async () => {},
				rollback: async () => {},
			},
		];
		const transaction = createTransaction(steps);

		expect(transaction.id).toBeDefined();
		expect(transaction.steps.length).toBe(1);
		expect(transaction.status).toBe("pending");
	});

	it("should execute a transaction successfully", async () => {
		let executed = false;
		const steps = [
			{
				execute: async () => {
					executed = true;
				},
				rollback: async () => {},
			},
		];
		const transaction = createTransaction(steps);

		const result = await executeTransaction(transaction);
		expect(result._tag).toBe("Success");
		expect(executed).toBe(true);
		expect((result as any).value.status).toBe("committed");
	});

	it("should rollback on execution failure", async () => {
		let executed = false;

		const steps = [
			{
				execute: async () => {
					executed = true;
					throw new Error("Execution failed");
				},
				rollback: async () => {
					// Rollback is called
				},
			},
		];
		const transaction = createTransaction(steps);

		const result = await executeTransaction(transaction);
		expect(result._tag).toBe("Failure");
		expect(executed).toBe(true);
	});

	it("should execute multiple steps in order", async () => {
		const order: number[] = [];
		const steps = [
			{
				execute: async () => {
					order.push(1);
				},
				rollback: async () => {},
			},
			{
				execute: async () => {
					order.push(2);
				},
				rollback: async () => {},
			},
			{
				execute: async () => {
					order.push(3);
				},
				rollback: async () => {},
			},
		];
		const transaction = createTransaction(steps);

		const result = await executeTransaction(transaction);
		expect(result._tag).toBe("Success");
		expect(order).toEqual([1, 2, 3]);
	});

	it("should rollback transaction manually", async () => {
		let rolledBack = false;
		const steps = [
			{
				execute: async () => {},
				rollback: async () => {
					rolledBack = true;
				},
			},
		];
		const transaction = createTransaction(steps);

		const result = await rollbackTransaction(transaction);
		expect(result._tag).toBe("Success");
		expect(rolledBack).toBe(true);
		expect((result as any).value.status).toBe("rolled-back");
	});
});
