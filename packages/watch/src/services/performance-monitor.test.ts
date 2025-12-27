import { describe, expect, it, vi } from "vitest";
import type { WatchEvent } from "../types";
import { PerformanceMonitor } from "./performance-monitor";

describe("PerformanceMonitor", () => {
	const createMockEvent = (type: string = "change"): WatchEvent => ({
		type: type as any,
		path: "/test/file.ts",
		timestamp: Date.now(),
	});

	describe("recordEvent", () => {
		it("should record event metrics", () => {
			const monitor = new PerformanceMonitor();
			const event = createMockEvent("change");

			monitor.recordEvent(event, 10);

			const stats = monitor.getStats();
			expect(stats.eventCount).toBe(1);
			expect(stats.eventsByType.change).toBe(1);
			expect(stats.avgProcessingTime).toBe(10);
		});

		it("should track multiple events", () => {
			const monitor = new PerformanceMonitor();

			monitor.recordEvent(createMockEvent("change"), 10);
			monitor.recordEvent(createMockEvent("add"), 20);
			monitor.recordEvent(createMockEvent("change"), 30);

			const stats = monitor.getStats();
			expect(stats.eventCount).toBe(3);
			expect(stats.eventsByType.change).toBe(2);
			expect(stats.eventsByType.add).toBe(1);
			expect(stats.avgProcessingTime).toBe(20);
		});

		it("should track min and max processing times", () => {
			const monitor = new PerformanceMonitor();

			monitor.recordEvent(createMockEvent(), 5);
			monitor.recordEvent(createMockEvent(), 100);
			monitor.recordEvent(createMockEvent(), 50);

			const stats = monitor.getStats();
			expect(stats.minProcessingTime).toBe(5);
			expect(stats.maxProcessingTime).toBe(100);
		});
	});

	describe("getStats", () => {
		it("should return performance statistics", () => {
			const monitor = new PerformanceMonitor();
			monitor.recordEvent(createMockEvent(), 10);

			const stats = monitor.getStats();

			expect(stats).toHaveProperty("uptime");
			expect(stats).toHaveProperty("eventCount");
			expect(stats).toHaveProperty("eventsPerSecond");
			expect(stats).toHaveProperty("avgProcessingTime");
			expect(stats).toHaveProperty("maxProcessingTime");
			expect(stats).toHaveProperty("minProcessingTime");
			expect(stats).toHaveProperty("eventsByType");
			expect(stats).toHaveProperty("totalProcessingTime");
		});

		it("should calculate events per second", () => {
			const monitor = new PerformanceMonitor();

			// Mock time passing
			vi.useFakeTimers();
			monitor.recordEvent(createMockEvent(), 10);
			vi.advanceTimersByTime(1000);
			monitor.recordEvent(createMockEvent(), 10);

			const stats = monitor.getStats();
			expect(stats.eventsPerSecond).toBeGreaterThan(0);

			vi.useRealTimers();
		});
	});

	describe("getRecommendations", () => {
		it("should provide recommendations for high event frequency", () => {
			const monitor = new PerformanceMonitor();

			// Record many events to trigger high frequency recommendation
			for (let i = 0; i < 150; i++) {
				monitor.recordEvent(createMockEvent(), 1);
			}

			const recommendations = monitor.getRecommendations();
			expect(recommendations.length).toBeGreaterThan(0);
			expect(recommendations.some((r) => r.includes("event frequency"))).toBe(true);
		});

		it("should provide recommendations for high processing time", () => {
			const monitor = new PerformanceMonitor();

			monitor.recordEvent(createMockEvent(), 100);

			const recommendations = monitor.getRecommendations();
			expect(recommendations.length).toBeGreaterThan(0);
		});

		it("should not provide recommendations for normal operation", () => {
			vi.useFakeTimers();
			const monitor = new PerformanceMonitor();

			monitor.recordEvent(createMockEvent(), 5);
			vi.advanceTimersByTime(1000); // Advance time to reduce eventsPerSecond
			monitor.recordEvent(createMockEvent(), 10);

			const recommendations = monitor.getRecommendations();
			expect(recommendations.length).toBe(0);

			vi.useRealTimers();
		});
	});

	describe("reset", () => {
		it("should reset all metrics", () => {
			const monitor = new PerformanceMonitor();

			monitor.recordEvent(createMockEvent(), 10);
			monitor.reset();

			const stats = monitor.getStats();
			expect(stats.eventCount).toBe(0);
			expect(stats.totalProcessingTime).toBe(0);
		});
	});

	describe("getEventTypeDistribution", () => {
		it("should calculate event type distribution", () => {
			const monitor = new PerformanceMonitor();

			monitor.recordEvent(createMockEvent("change"), 10);
			monitor.recordEvent(createMockEvent("change"), 10);
			monitor.recordEvent(createMockEvent("add"), 10);

			const distribution = monitor.getEventTypeDistribution();
			expect(distribution.change).toBeCloseTo(66.67, 1);
			expect(distribution.add).toBeCloseTo(33.33, 1);
		});

		it("should return empty object when no events recorded", () => {
			const monitor = new PerformanceMonitor();
			const distribution = monitor.getEventTypeDistribution();
			expect(distribution).toEqual({});
		});
	});
});
