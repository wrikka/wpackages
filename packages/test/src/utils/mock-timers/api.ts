import { createMockTimers, getMockTimers } from "./global";
import type { MockTimerManager } from "./manager";

export function withMockTimers<T>(fn: (timers: MockTimerManager) => T): T {
	const timers = createMockTimers();

	try {
		timers.install();
		return fn(timers);
	} finally {
		timers.uninstall();
	}
}

export function advanceTimeBy(ms: number): void {
	const timers = getMockTimers();
	if (!timers.isInstalled()) {
		throw new Error("Mock timers are not installed. Call useFakeTimers() first.");
	}
	timers.tick(ms);
}

export function advanceTimeTo(time: number | string | Date): void {
	const timers = getMockTimers();
	if (!timers.isInstalled()) {
		throw new Error("Mock timers are not installed. Call useFakeTimers() first.");
	}
	timers.advanceTimeTo(time);
}

export function runAllTimers(): void {
	const timers = getMockTimers();
	if (!timers.isInstalled()) {
		throw new Error("Mock timers are not installed. Call useFakeTimers() first.");
	}
	timers.runAllTimers();
}

export function runOnlyPendingTimers(): void {
	const timers = getMockTimers();
	if (!timers.isInstalled()) {
		throw new Error("Mock timers are not installed. Call useFakeTimers() first.");
	}
	timers.runOnlyPendingTimers();
}

export function useRealTimers(): void {
	getMockTimers().uninstall();
}

export function useFakeTimers(): void {
	getMockTimers().install();
}
