import { describe, expect, it } from "vitest";
import {
	calculatePercentiles,
	calculateStatistics,
	mean,
	median,
	opsPerSecond,
	percentile,
	standardDeviation,
	variance,
} from "./stats-core";

describe("statisticsUtils", () => {
	const data = [10, 20, 30, 40, 50];
	const emptyData: number[] = [];

	it("should calculate mean correctly", () => {
		expect(mean(data)).toBe(30);
		expect(mean(emptyData)).toBe(0);
	});

	it("should calculate median correctly", () => {
		expect(median(data)).toBe(30);
		expect(median([10, 20, 30, 40])).toBe(25);
		expect(median(emptyData)).toBe(0);
	});

	it("should calculate variance correctly", () => {
		expect(variance(data)).toBe(200);
		expect(variance(emptyData)).toBe(0);
	});

	it("should calculate standard deviation correctly", () => {
		expect(standardDeviation(data)).toBeCloseTo(14.1421356);
		expect(standardDeviation(emptyData)).toBe(0);
	});

	it("should calculate percentile correctly", () => {
		const sortedData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		expect(percentile(sortedData, 50)).toBe(5.5);
		expect(percentile(sortedData, 90)).toBe(9.1);
		expect(percentile(sortedData, 25)).toBe(3.25);
		expect(percentile(emptyData, 50)).toBe(0);
	});

	it("should calculate all percentiles", () => {
		const percentiles = calculatePercentiles(data);
		expect(percentiles.p50).toBe(30);
		expect(percentiles.p99).toBeCloseTo(49.6);
	});

	it("should calculate all statistics", () => {
		const stats = calculateStatistics(data);
		expect(stats.mean).toBe(30);
		expect(stats.min).toBe(10);
		expect(stats.max).toBe(50);
		expect(stats.standardDeviation).toBeCloseTo(14.1421356);
	});

	it("should calculate ops per second", () => {
		expect(opsPerSecond(100)).toBe(10); // 100ms per op -> 10 ops/sec
		expect(opsPerSecond(0)).toBe(0);
	});
});
