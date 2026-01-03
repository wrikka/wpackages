/**
 * Testing utilities
 */

// Core Assertions
export { Assertion, expect } from "./assertions";
export * from "./assertions/collections";
export * from "./assertions/equality";
export * from "./assertions/instance";
export * from "./assertions/promises";
export * from "./assertions/throws";
export * from "./assertions/truthiness";
export * from "./assertions/types";
export * from "./assertions/schema";

// Error
export { AssertionError } from "./error";

// Snapshots
export { clearSnapshots, getAllSnapshots, getSnapshot, matchSnapshot, storeSnapshot } from "./snapshot";

// Matchers
export {
	arrayLengthMatcher,
	createMatcher,
	deepEqualMatcher,
	patternMatcher,
	rangeMatcher,
	typeMatcher,
} from "./matchers";

// Mocks and spies
export { createMock } from "./mock";
export type { MockFn } from "./mock";
export { restore, spyOn } from "./spy";

// Async helpers
export { batch, delay, race, retry, sequential, waitFor, withTimeout } from "./async-helpers";

// File Discovery
export { findTestFiles } from "./file-discovery";

// E2E Helpers
export { waitForElement } from "./e2e";
export type { WaitForElementOptions } from "./e2e";
