import { createConsoleLogger } from "@wpackages/observability";
import type { RouteMatch } from "../types";

export interface RouteMetricsOptions {
	readonly enabled?: boolean;
	readonly sampleRate?: number;
}

interface RouteMetric {
	readonly path: string;
	readonly method?: string;
	readonly status?: number;
	readonly duration: number;
	readonly timestamp: number;
}

export class RouteMetrics {
	private readonly logger: ReturnType<typeof createConsoleLogger>;
	private readonly metrics: RouteMetric[] = [];
	private readonly options: Required<RouteMetricsOptions>;

	constructor(options: RouteMetricsOptions = {}) {
		this.options = {
			enabled: options.enabled ?? true,
			sampleRate: options.sampleRate ?? 1,
		};
		this.logger = createConsoleLogger({
			minLevel: "info",
			baseMeta: { service: "wrouter" },
		});
	}

	recordRouteMatch(match: RouteMatch, duration: number): void {
		if (!this.options.enabled || Math.random() > this.options.sampleRate) {
			return;
		}

		const metric: RouteMetric = {
			path: match.route.path,
			duration,
			timestamp: Date.now(),
		};

		this.metrics.push(metric);
		this.logger.info("route_match", metric);
	}

	recordRouteRequest(request: Request, match: RouteMatch | null, status: number, duration: number): void {
		if (!this.options.enabled || Math.random() > this.options.sampleRate) {
			return;
		}

		const url = new URL(request.url);
		const metric: RouteMetric = {
			path: match?.route.path ?? url.pathname,
			method: request.method,
			status,
			duration,
			timestamp: Date.now(),
		};

		this.metrics.push(metric);
		this.logger.info("route_request", metric);
	}

	recordRouteError(error: Error, match: RouteMatch | null, duration: number): void {
		if (!this.options.enabled || Math.random() > this.options.sampleRate) {
			return;
		}

		const metric: RouteMetric = {
			path: match?.route.path ?? "unknown",
			status: 500,
			duration,
			timestamp: Date.now(),
		};

		this.metrics.push(metric);
		this.logger.error("route_error", { ...metric, error: error.message });
	}

	getMetrics(): readonly RouteMetric[] {
		return Object.freeze([...this.metrics]);
	}

	getMetricsByPath(path: string): readonly RouteMetric[] {
		return Object.freeze(this.metrics.filter((m) => m.path === path));
	}

	getAverageDuration(path?: string): number {
		const filtered = path ? this.getMetricsByPath(path) : this.metrics;
		if (filtered.length === 0) return 0;
		const total = filtered.reduce((sum, m) => sum + m.duration, 0);
		return total / filtered.length;
	}

	getP95Duration(path?: string): number {
		const filtered = path ? this.getMetricsByPath(path) : this.metrics;
		if (filtered.length === 0) return 0;
		const sorted = [...filtered].sort((a, b) => a.duration - b.duration);
		const index = Math.floor(sorted.length * 0.95);
		return sorted[index]?.duration ?? 0;
	}

	clear(): void {
		this.metrics.length = 0;
	}
}

export const createRouteMetrics = (options: RouteMetricsOptions = {}) => {
	return new RouteMetrics(options);
};
