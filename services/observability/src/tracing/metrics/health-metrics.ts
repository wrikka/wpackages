export interface HealthMetrics {
	memoryUsage: {
		rss: number;
		heapTotal: number;
		heapUsed: number;
		external: number;
	};
	cpuUsage: {
		user: number;
		system: number;
	};
	eventLoopDelay: number;
	uptime: number;
	timestamp: number;
}

export class HealthMetricsCollector {
	private lastCpuUsage: { user: number; system: number } = { user: 0, system: 0 };
	private lastCpuTime: number = 0;

	collect(): HealthMetrics {
		const memoryUsage = process.memoryUsage();
		const cpuUsage = process.cpuUsage();
		const now = Date.now();

		const cpuUser = cpuUsage.user - this.lastCpuUsage.user;
		const cpuSystem = cpuUsage.system - this.lastCpuUsage.system;
		const timeDelta = now - this.lastCpuTime;

		this.lastCpuUsage = { user: cpuUsage.user, system: cpuUsage.system };
		this.lastCpuTime = now;

		return {
			memoryUsage: {
				rss: memoryUsage.rss,
				heapTotal: memoryUsage.heapTotal,
				heapUsed: memoryUsage.heapUsed,
				external: memoryUsage.external,
			},
			cpuUsage: {
				user: timeDelta > 0 ? (cpuUser / timeDelta) * 1000 : 0,
				system: timeDelta > 0 ? (cpuSystem / timeDelta) * 1000 : 0,
			},
			eventLoopDelay: this.measureEventLoopDelay(),
			uptime: process.uptime(),
			timestamp: now,
		};
	}

	private measureEventLoopDelay(): number {
		const start = process.hrtime.bigint();
		setImmediate(() => {
			const end = process.hrtime.bigint();
			return Number(end - start) / 1000000;
		});
		return 0;
	}
}

export function createHealthMetricsCollector(): HealthMetricsCollector {
	return new HealthMetricsCollector();
}
