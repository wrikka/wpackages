import type { WatchEvent } from "../types";

export class PerformanceMonitor {
	private startTime: number;
	private eventCount: number;
	private processingTimes: number[];
	private eventsByType: Record<string, number>;
	private maxProcessingTime: number;
	private minProcessingTime: number;

	constructor() {
		this.startTime = Date.now();
		this.eventCount = 0;
		this.processingTimes = [];
		this.eventsByType = {};
		this.maxProcessingTime = 0;
		this.minProcessingTime = Infinity;
	}

	public recordEvent(event: WatchEvent, processingTimeMs: number): void {
		this.eventCount++;
		this.processingTimes.push(processingTimeMs);
		this.eventsByType[event.type] = (this.eventsByType[event.type] ?? 0) + 1;
		this.maxProcessingTime = Math.max(this.maxProcessingTime, processingTimeMs);
		this.minProcessingTime = Math.min(this.minProcessingTime, processingTimeMs);
	}

	public getStats(): any {
		const uptime = Date.now() - this.startTime;
		const eventsPerSecond = this.eventCount / (uptime / 1000);
		const totalProcessingTime = this.processingTimes.reduce((sum, time) => sum + time, 0);
		const avgProcessingTime = this.processingTimes.length > 0 ? totalProcessingTime / this.processingTimes.length : 0;

		return {
			uptime,
			eventCount: this.eventCount,
			eventsPerSecond,
			avgProcessingTime,
			maxProcessingTime: this.maxProcessingTime,
			minProcessingTime: this.minProcessingTime === Infinity ? 0 : this.minProcessingTime,
			eventsByType: { ...this.eventsByType },
			totalProcessingTime,
		};
	}

	public getRecommendations(): string[] {
		const recommendations: string[] = [];
		const stats = this.getStats();

		if (stats.eventsPerSecond > 100) {
			recommendations.push(
				"High event frequency detected. Consider increasing debounce time or adding more specific ignore patterns.",
			);
		}

		if (stats.avgProcessingTime > 50) {
			recommendations.push(
				"Average event processing time is high. Consider optimizing event handlers or reducing workload.",
			);
		}

		if (stats.maxProcessingTime > 500) {
			recommendations.push(
				"Some events are taking very long to process. Investigate event handlers for potential bottlenecks.",
			);
		}

		if (this.eventCount > 10000) {
			recommendations.push(
				"High event count may indicate memory pressure. Consider implementing event batching or cleanup strategies.",
			);
		}

		return recommendations;
	}

	public reset(): void {
		this.startTime = Date.now();
		this.eventCount = 0;
		this.processingTimes = [];
		this.eventsByType = {};
		this.maxProcessingTime = 0;
		this.minProcessingTime = Infinity;
	}

	public getEventTypeDistribution(): Record<string, number> {
		if (this.eventCount === 0) return {};

		const distribution: Record<string, number> = {};
		for (const [type, count] of Object.entries(this.eventsByType)) {
			distribution[type] = (count / this.eventCount) * 100;
		}
		return distribution;
	}
}
