import type { TestSuite } from "../types";

const testSuites: TestSuite[] = [];

export function addSuite(suite: TestSuite): void {
	testSuites.push(suite);
}

export function getSuites(): TestSuite[] {
	return testSuites;
}

export function clearSuites(): void {
	testSuites.length = 0;
}
