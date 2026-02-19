import type { Timer, TimerState } from "./types";

export class MockTimerManager {
	private state: TimerState;
	private installed = false;

	constructor() {
		this.state = {
			now: Date.now(),
			timers: new Map(),
			nextId: 1,
			originalDate: Date,
			originalSetTimeout: setTimeout,
			originalClearTimeout: clearTimeout,
			originalSetInterval: setInterval,
			originalClearInterval: clearInterval,
		};
	}

	public install(): void {
		if (this.installed) {
			throw new Error("Mock timers are already installed");
		}

		this.installed = true;

		global.Date = this.createMockDate();
		global.setTimeout = this.mockSetTimeout.bind(this) as any;
		global.clearTimeout = this.mockClearTimeout.bind(this);
		global.setInterval = this.mockSetInterval.bind(this) as any;
		global.clearInterval = this.mockClearInterval.bind(this);
	}

	public uninstall(): void {
		if (!this.installed) {
			return;
		}

		global.Date = this.state.originalDate;
		global.setTimeout = this.state.originalSetTimeout;
		global.clearTimeout = this.state.originalClearTimeout;
		global.setInterval = this.state.originalSetInterval;
		global.clearInterval = this.state.originalClearInterval;

		this.state.timers.clear();
		this.installed = false;
	}

	public setTime(time: number | string | Date): void {
		const newTime = typeof time === "number" ? time : new this.state.originalDate(time).getTime();
		this.state.now = newTime;
	}

	public tick(ms: number): void {
		const targetTime = this.state.now + ms;
		this.runAllTimersUntil(targetTime);
	}

	public runAllTimers(): void {
		const timers = Array.from(this.state.timers.values());
		if (timers.length === 0) return;
		const maxTime = Math.max(...timers.map((t) => t.createdAt + t.delay));
		this.runAllTimersUntil(maxTime);
	}

	public runOnlyPendingTimers(): void {
		const timers = Array.from(this.state.timers.values());
		if (timers.length === 0) return;
		const nextExecutionTime = Math.min(...timers.map((t) => t.createdAt + t.delay));
		this.runAllTimersUntil(nextExecutionTime);
	}

	public getTimerCount(): number {
		return this.state.timers.size;
	}

	public getPendingTimers(): Timer[] {
		return Array.from(this.state.timers.values());
	}

	public clearAllTimers(): void {
		this.state.timers.clear();
	}

	public isInstalled(): boolean {
		return this.installed;
	}

	public getCurrentTime(): number {
		return this.state.now;
	}

	public advanceTimeTo(time: number | string | Date): void {
		const targetTime = typeof time === "number" ? time : new this.state.originalDate(time).getTime();
		this.runAllTimersUntil(targetTime);
	}

	private createMockDate(): typeof Date {
		const state = this.state;
		const mockDate = class extends Date {
			constructor(...args: any[]) {
				if (args.length === 0) {
					super(state.now);
				} else {
					super(...args);
				}
			}

			static now(): number {
				return state.now;
			}

			static parse(dateString: string): number {
				return state.originalDate.parse(dateString);
			}

			static UTC(...args: any[]): number {
				return state.originalDate.UTC(...args);
			}
		} as any;

		Object.assign(mockDate, {
			toString: state.originalDate.toString.bind(state.originalDate),
			toUTCString: state.originalDate.toUTCString.bind(state.originalDate),
			toISOString: state.originalDate.toISOString.bind(state.originalDate),
		});

		return mockDate;
	}

	private mockSetTimeout(callback: () => void, delay: number): number {
		if (!this.installed) {
			return this.state.originalSetTimeout(callback, delay);
		}

		const id = this.state.nextId++;
		const timer: Timer = {
			id,
			type: "timeout",
			callback,
			delay,
			createdAt: this.state.now,
		};

		this.state.timers.set(id, timer);
		return id;
	}

	private mockClearTimeout(id: number): void {
		if (!this.installed) {
			this.state.originalClearTimeout(id);
			return;
		}

		this.state.timers.delete(id);
	}

	private mockSetInterval(callback: () => void, delay: number): number {
		if (!this.installed) {
			return this.state.originalSetInterval(callback, delay);
		}

		const id = this.state.nextId++;
		const timer: Timer = {
			id,
			type: "interval",
			callback,
			delay,
			createdAt: this.state.now,
			interval: true,
		};

		this.state.timers.set(id, timer);
		return id;
	}

	private mockClearInterval(id: number): void {
		if (!this.installed) {
			this.state.originalClearInterval(id);
			return;
		}

		this.state.timers.delete(id);
	}

	private runAllTimersUntil(targetTime: number): void {
		while (true) {
			const timersToExecute = this.getTimersToExecute(this.state.now);

			if (timersToExecute.length === 0) {
				const nextTimes = Array.from(this.state.timers.values())
					.map((t) => t.createdAt + t.delay)
					.filter((time) => time > this.state.now);

				if (nextTimes.length === 0 || Math.min(...nextTimes) > targetTime) {
					break; // No more timers to run in the given timeframe
				}

				this.state.now = Math.min(...nextTimes);
				continue;
			}

			for (const timer of timersToExecute) {
				this.state.now = timer.createdAt + timer.delay;
				if (this.state.now > targetTime) {
					this.state.now = targetTime;
					return;
				}
				this.executeTimer(timer);
			}
		}

		this.state.now = targetTime;
	}

	private getTimersToExecute(currentTime: number): Timer[] {
		return Array.from(this.state.timers.values())
			.filter((timer) => timer.createdAt + timer.delay <= currentTime)
			.sort((a, b) => a.createdAt + a.delay - (b.createdAt + b.delay) || a.id - b.id);
	}

	private executeTimer(timer: Timer): void {
		timer.executedAt = this.state.now;
		timer.callback();

		if (timer.type === "timeout") {
			this.state.timers.delete(timer.id);
		} else if (timer.type === "interval") {
			timer.createdAt = this.state.now;
		}
	}
}
