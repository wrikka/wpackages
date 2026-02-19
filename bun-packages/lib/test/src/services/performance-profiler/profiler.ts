import { EventEmitter } from "node:events";
import { performance, PerformanceObserver } from "node:perf_hooks";

import type { HookProfile, PerformanceThresholds, SuiteProfile, TestProfile } from "./types";

export class PerformanceProfiler extends EventEmitter {
	private profiles = new Map<string, SuiteProfile>();
	private currentSuite: SuiteProfile | null = null;
	private currentTest: TestProfile | null = null;
	private memorySnapshots: number[] = [];
	private performanceObserver: PerformanceObserver;
	private thresholds: PerformanceThresholds;
	private hookStartTimes = new Map<string, number>();

	constructor(thresholds: Partial<PerformanceThresholds> = {}) {
		super();
		this.thresholds = {
			testDuration: 5000,
			suiteDuration: 30000,
			memoryUsage: 100 * 1024 * 1024,
			hookDuration: 1000,
			...thresholds,
		};

		this.performanceObserver = new PerformanceObserver((list) => {
			const entries = list.getEntries();
			for (const entry of entries) {
				this.emit("performanceEntry", entry);
			}
		});
		this.performanceObserver.observe({ entryTypes: ["measure", "mark"] });
	}

	public startSuite(name: string, file: string): void {
		this.currentSuite = {
			name,
			file,
			startTime: performance.now(),
			endTime: 0,
			duration: 0,
			tests: [],
			hooks: [],
			setupTime: 0,
			teardownTime: 0,
		};

		this.memorySnapshots.push(process.memoryUsage().heapUsed);

		performance.mark(`suite-start-${name}`);
		this.emit("suiteStart", { name, file });
	}

	public endSuite(): void {
		if (!this.currentSuite) return;

		this.currentSuite.endTime = performance.now();
		this.currentSuite.duration = this.currentSuite.endTime - this.currentSuite.startTime;

		performance.mark(`suite-end-${this.currentSuite.name}`);
		performance.measure(
			`suite-${this.currentSuite.name}`,
			`suite-start-${this.currentSuite.name}`,
			`suite-end-${this.currentSuite.name}`,
		);

		if (this.currentSuite.duration > this.thresholds.suiteDuration) {
			this.emit("slowSuite", {
				suite: this.currentSuite,
				duration: this.currentSuite.duration,
				threshold: this.thresholds.suiteDuration,
			});
		}

		this.profiles.set(this.currentSuite.name, this.currentSuite);
		this.emit("suiteEnd", this.currentSuite);
		this.currentSuite = null;
	}

	public startTest(name: string, suite: string): void {
		if (!this.currentSuite) return;

		this.currentTest = {
			name,
			suite,
			file: this.currentSuite.file,
			startTime: performance.now(),
			endTime: 0,
			duration: 0,
			hooks: [],
			status: "running",
		};

		const memoryBefore = process.memoryUsage();
		this.currentTest.memoryUsage = { ...memoryBefore };

		const cpuBefore = process.cpuUsage();
		this.currentTest.cpuUsage = cpuBefore;

		performance.mark(`test-start-${name}`);
		this.emit("testStart", { name, suite });
	}

	public endTest(status: "passed" | "failed" | "skipped", error?: Error): void {
		if (!this.currentTest || !this.currentSuite) return;

		this.currentTest.endTime = performance.now();
		this.currentTest.duration = this.currentTest.endTime - this.currentTest.startTime;
		this.currentTest.status = status;
		this.currentTest.error = error;

		if (this.currentTest.cpuUsage) {
			const cpuAfter = process.cpuUsage(this.currentTest.cpuUsage);
			this.currentTest.cpuUsage = cpuAfter;
		}

		if (this.currentTest.memoryUsage) {
			const memoryAfter = process.memoryUsage();
			this.currentTest.memoryUsage = {
				rss: memoryAfter.rss - this.currentTest.memoryUsage.rss,
				heapTotal: memoryAfter.heapTotal - this.currentTest.memoryUsage.heapTotal,
				heapUsed: memoryAfter.heapUsed - this.currentTest.memoryUsage.heapUsed,
				external: memoryAfter.external - this.currentTest.memoryUsage.external,
				arrayBuffers: memoryAfter.arrayBuffers - (this.currentTest.memoryUsage.arrayBuffers || 0),
			};
		}

		performance.mark(`test-end-${this.currentTest.name}`);
		performance.measure(
			`test-${this.currentTest.name}`,
			`test-start-${this.currentTest.name}`,
			`test-end-${this.currentTest.name}`,
		);

		if (this.currentTest.duration > this.thresholds.testDuration) {
			this.emit("slowTest", {
				test: this.currentTest,
				duration: this.currentTest.duration,
				threshold: this.thresholds.testDuration,
			});
		}

		if (
			this.currentTest.memoryUsage?.heapUsed
			&& this.currentTest.memoryUsage.heapUsed > this.thresholds.memoryUsage
		) {
			this.emit("memoryLeak", {
				test: this.currentTest,
				usage: this.currentTest.memoryUsage.heapUsed,
				threshold: this.thresholds.memoryUsage,
			});
		}

		this.currentSuite.tests.push(this.currentTest);
		this.emit("testEnd", this.currentTest);
		this.currentTest = null;
	}

	public startHook(
		type: "beforeAll" | "afterAll" | "beforeEach" | "afterEach",
		name: string,
	): void {
		const startTime = performance.now();
		this.hookStartTimes.set(`${type}:${name}`, startTime);
		performance.mark(`hook-start-${type}-${name}`);
		this.emit("hookStart", { type, name });
	}

	public endHook(
		type: "beforeAll" | "afterAll" | "beforeEach" | "afterEach",
		name: string,
	): void {
		const endTime = performance.now();
		performance.mark(`hook-end-${type}-${name}`);
		performance.measure(
			`hook-${type}-${name}`,
			`hook-start-${type}-${name}`,
			`hook-end-${type}-${name}`,
		);

		const startTime = this.hookStartTimes.get(`${type}:${name}`) ?? endTime;
		this.hookStartTimes.delete(`${type}:${name}`);
		const duration = endTime - startTime;

		if (duration > this.thresholds.hookDuration) {
			this.emit("slowHook", {
				type,
				name,
				duration,
				threshold: this.thresholds.hookDuration,
			});
		}

		const hook: HookProfile = {
			type,
			name,
			startTime,
			endTime,
			duration,
		};

		if (this.currentTest) {
			this.currentTest.hooks.push(hook);
		} else if (this.currentSuite) {
			this.currentSuite.hooks.push(hook);
		}

		this.emit("hookEnd", { type, name, duration });
	}

	public clear(): void {
		this.profiles.clear();
		this.currentSuite = null;
		this.currentTest = null;
		this.memorySnapshots = [];
		this.emit("cleared");
	}

	public getThresholds(): PerformanceThresholds {
		return { ...this.thresholds };
	}

	public updateThresholds(thresholds: Partial<PerformanceThresholds>): void {
		this.thresholds = { ...this.thresholds, ...thresholds };
		this.emit("thresholdsUpdated", this.thresholds);
	}

	public getStats(): {
		suitesProfiled: number;
		testsProfiled: number;
		currentSuite: string | null;
		currentTest: string | null;
		thresholds: PerformanceThresholds;
	} {
		const totalTests = Array.from(this.profiles.values()).reduce(
			(sum, suite) => sum + suite.tests.length,
			0,
		);

		return {
			suitesProfiled: this.profiles.size,
			testsProfiled: totalTests,
			currentSuite: this.currentSuite?.name || null,
			currentTest: this.currentTest?.name || null,
			thresholds: this.thresholds,
		};
	}

	public getProfiles(): ReadonlyMap<string, SuiteProfile> {
		return this.profiles;
	}

	public destroy(): void {
		this.performanceObserver.disconnect();
		this.clear();
		this.removeAllListeners();
	}
}
