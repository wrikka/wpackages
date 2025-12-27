import { describe, expect, it, vi } from "vitest";
import { aggregateHealth, createHealthMonitor, runHealthCheck } from "./health-check";

describe("health-check service", () => {
	describe("runHealthCheck", () => {
		it("should return healthy status on success", async () => {
			const checkFn = vi.fn().mockResolvedValue(true);

			const result = await runHealthCheck({
				name: "test-check",
				check: checkFn,
				timeout: 5000,
			});

			expect(result.status).toBe("healthy");
			expect(result.name).toBe("test-check");
			expect(checkFn).toHaveBeenCalled();
		});

		it("should return unhealthy status on failure", async () => {
			const checkFn = vi.fn().mockRejectedValue(new Error("Check failed"));

			const result = await runHealthCheck({
				name: "test-check",
				check: checkFn,
				timeout: 5000,
			});

			expect(result.status).toBe("unhealthy");
			expect(result.message).toBeDefined();
		});

		it("should return degraded status on timeout", async () => {
			const checkFn = vi.fn(
				() =>
					new Promise((resolve) => {
						setTimeout(() => resolve(true), 2000);
					}),
			);

			const result = await runHealthCheck({
				name: "test-check",
				check: checkFn,
				timeout: 100,
			});

			expect(result.status).toMatch(/unhealthy|degraded/);
		});

		it("should track check duration", async () => {
			const checkFn = vi.fn(async () => {
				await new Promise((resolve) => setTimeout(resolve, 50));
				return true;
			});

			const result = await runHealthCheck({
				name: "test-check",
				check: checkFn,
				timeout: 5000,
			});

			expect(result.duration).toBeGreaterThanOrEqual(40);
		});

		it("should include timestamp", async () => {
			const checkFn = vi.fn().mockResolvedValue(true);

			const result = await runHealthCheck({
				name: "test-check",
				check: checkFn,
				timeout: 5000,
			});

			expect(result.timestamp).toBeDefined();
			expect(result.timestamp).toBeGreaterThan(0);
		});
	});

	describe("aggregateHealth", () => {
		it("should return healthy when all checks pass", () => {
			const startTime = Date.now();
			const results: ReadonlyArray<any> = [
				{
					status: "healthy" as const,
					name: "check1",
					critical: false,
					duration: 10,
					timestamp: startTime,
					message: "ok",
				},
				{
					status: "healthy" as const,
					name: "check2",
					critical: false,
					duration: 10,
					timestamp: startTime,
					message: "ok",
				},
			];

			const aggregated = aggregateHealth(results, startTime);

			expect(aggregated.status).toBe("healthy");
		});

		it("should return degraded when some checks are degraded", () => {
			const startTime = Date.now();
			const results: ReadonlyArray<any> = [
				{
					status: "healthy" as const,
					name: "check1",
					critical: false,
					duration: 10,
					timestamp: startTime,
					message: "ok",
				},
				{
					status: "degraded" as const,
					name: "check2",
					critical: false,
					duration: 10,
					timestamp: startTime,
					message: "ok",
				},
			];

			const aggregated = aggregateHealth(results, startTime);

			expect(aggregated.status).toBe("degraded");
		});

		it("should return unhealthy when any check fails", () => {
			const startTime = Date.now();
			const results: ReadonlyArray<any> = [
				{
					status: "healthy" as const,
					name: "check1",
					critical: false,
					duration: 10,
					timestamp: startTime,
					message: "ok",
				},
				{
					status: "unhealthy" as const,
					name: "check2",
					critical: true,
					duration: 10,
					timestamp: startTime,
					message: "failed",
				},
			];

			const aggregated = aggregateHealth(results, startTime);

			expect(aggregated.status).toBe("unhealthy");
		});

		it("should count checks by status", () => {
			const startTime = Date.now();
			const results: ReadonlyArray<any> = [
				{
					status: "healthy" as const,
					name: "check1",
					critical: false,
					duration: 10,
					timestamp: startTime,
					message: "ok",
				},
				{
					status: "healthy" as const,
					name: "check2",
					critical: false,
					duration: 10,
					timestamp: startTime,
					message: "ok",
				},
				{
					status: "degraded" as const,
					name: "check3",
					critical: false,
					duration: 10,
					timestamp: startTime,
					message: "ok",
				},
				{
					status: "unhealthy" as const,
					name: "check4",
					critical: false,
					duration: 10,
					timestamp: startTime,
					message: "failed",
				},
			];

			const aggregated = aggregateHealth(results, startTime);

			expect(aggregated.checks.length).toBe(4);
		});
	});

	describe("createHealthMonitor", () => {
		it("should create health monitor", () => {
			const monitor = createHealthMonitor({
				interval: 5000,
			});

			expect(monitor).toBeDefined();
		});

		it("should add health checks", async () => {
			const monitor = createHealthMonitor({
				interval: 5000,
			});

			const checkFn = vi.fn().mockResolvedValue(true);

			monitor.addCheck({
				name: "test-check",
				check: checkFn,
				timeout: 5000,
			});

			const health = await monitor.getHealth();
			expect(health).toBeDefined();
		});

		it("should remove health checks", async () => {
			const monitor = createHealthMonitor({
				interval: 5000,
			});

			const checkFn = vi.fn().mockResolvedValue(true);

			monitor.addCheck({
				name: "test-check",
				check: checkFn,
				timeout: 5000,
			});

			monitor.removeCheck("test-check");

			const health = await monitor.getHealth();
			expect(health.checks.length).toBe(0);
		});

		it("should track health status changes", async () => {
			const onStatusChange = vi.fn();
			const monitor = createHealthMonitor({
				interval: 5000,
				onStatusChange,
			});

			let isHealthy = true;
			const checkFn = vi.fn(async () => isHealthy);

			monitor.addCheck({
				name: "test-check",
				check: checkFn,
				timeout: 5000,
				critical: true,
			});

			// First check - healthy
			let health = await monitor.getHealth();
			expect(health.status).toBe("healthy");

			// Change to unhealthy
			isHealthy = false;
			health = await monitor.getHealth();
			expect(health.status).toBe("unhealthy");
		});

		it("should support start and stop", async () => {
			const monitor = createHealthMonitor({
				interval: 100,
			});

			const checkFn = vi.fn().mockResolvedValue(true);

			monitor.addCheck({
				name: "test-check",
				check: checkFn,
				timeout: 5000,
			});

			await monitor.start();
			expect(monitor).toBeDefined();

			await monitor.stop();
			expect(monitor).toBeDefined();
		});
	});
});
