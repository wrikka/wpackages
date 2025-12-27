/**
 * Testing utilities
 */

// Assertions
export { expect, AssertionError, Assertion } from "./assertions";

// Snapshots
export {
	storeSnapshot,
	getSnapshot,
	matchSnapshot,
	clearSnapshots,
	getAllSnapshots,
} from "./snapshot";

// Matchers
export {
	createMatcher,
	deepEqualMatcher,
	typeMatcher,
	rangeMatcher,
	arrayLengthMatcher,
	patternMatcher,
} from "./matchers";

// Mocks and spies
export { createMock, spyOn, restore } from "./mock";
export type { MockFn } from "./mock";

// Async helpers
export {
	waitFor,
	delay,
	retry,
	race,
	withTimeout,
	batch,
	sequential,
} from "./async-helpers";
