import { MockTimerManager } from "./manager";

let globalMockTimers: MockTimerManager | undefined;

export function createMockTimers(): MockTimerManager {
	if (!globalMockTimers) {
		globalMockTimers = new MockTimerManager();
	}
	return globalMockTimers;
}

export function getMockTimers(): MockTimerManager {
	if (!globalMockTimers) {
		globalMockTimers = new MockTimerManager();
	}
	return globalMockTimers;
}
