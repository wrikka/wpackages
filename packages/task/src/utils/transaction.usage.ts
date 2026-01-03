/**
 * ตัวอย่างการใช้งาน createTransaction
 *
 * Run: bun run packages/task/src/utils/transaction.usage.ts
 */

import { createTransaction, executeTransaction } from "../services/transaction";

// This is a simple in-memory mock to simulate file operations.
const mockFileSystem = new Map<string, string>();

console.log("--- Transaction Usage Example ---");

// Step 1: Create a file
const createStep = {
	async execute() {
		console.log("EXECUTE: Creating file 'transaction.log'...");
		if (mockFileSystem.has("transaction.log")) {
			throw new Error("File already exists.");
		}
		mockFileSystem.set("transaction.log", "");
		console.log("  -> File 'transaction.log' created.");
	},
	async rollback() {
		console.log("ROLLBACK: Deleting file 'transaction.log'...");
		mockFileSystem.delete("transaction.log");
		console.log("  -> File 'transaction.log' deleted.");
	},
};

// Step 2: Write content to the file
const writeStep = {
	async execute() {
		console.log("EXECUTE: Writing content to 'transaction.log'...");
		if (!mockFileSystem.has("transaction.log")) {
			throw new Error("File does not exist.");
		}
		mockFileSystem.set("transaction.log", "Transaction committed successfully.");
		console.log("  -> Content written.");
	},
	async rollback() {
		console.log("ROLLBACK: Clearing content from 'transaction.log'...");
		if (mockFileSystem.has("transaction.log")) {
			mockFileSystem.set("transaction.log", "");
		}
		console.log("  -> Content cleared.");
	},
};

// Step 3: A step that will fail
const failingStep = {
	async execute() {
		console.log("EXECUTE: Performing a failing operation...");
		throw new Error("Intentional failure to trigger rollback.");
	},
	async rollback() {
		console.log("ROLLBACK: Rollback for failing operation (should not be called).");
	},
};

async function runSuccessfulTransaction() {
	console.log("\n--- Running a Successful Transaction ---");
	mockFileSystem.clear(); // Reset state

	const transaction = createTransaction([createStep, writeStep]);
	console.log(`Transaction created with ID: ${transaction.id}`);

	const result = await executeTransaction(transaction);

	if (result._tag === "Success") {
		console.log("\nTransaction committed successfully!");
		console.log("Final transaction status:", result.value.status);
	} else {
		console.error("\nTransaction failed:", result.error.message);
	}

	console.log("Final file system state:", Object.fromEntries(mockFileSystem));
}

async function runFailingTransaction() {
	console.log("\n--- Running a Failing Transaction (to demonstrate rollback) ---");
	mockFileSystem.clear(); // Reset state

	const transaction = createTransaction([createStep, writeStep, failingStep]);
	console.log(`Transaction created with ID: ${transaction.id}`);

	const result = await executeTransaction(transaction);

	if (result._tag === "Success") {
		console.log("\nTransaction committed successfully! (This should not happen)");
	} else {
		console.error("\nTransaction failed as expected:", result.error.message);
	}

	console.log("Final file system state (should be empty after rollback):", Object.fromEntries(mockFileSystem));
}

async function main() {
	await runSuccessfulTransaction();
	await runFailingTransaction();
}

main();
