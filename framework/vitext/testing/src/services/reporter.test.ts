import { describe, it } from "vitest";
import { expect } from "../utils";
import { formatReport, generateJsonReport, generateHtmlReport } from "./reporter";
import type { TestReport } from "../types";

describe("Reporter", () => {
	const mockReport: TestReport = {
		suites: [
			{
				name: "Math",
				tests: [
					{
						name: "should add",
						duration: 10,
						status: "passed",
						error: undefined,
						assertions: [],
					},
					{
						name: "should subtract",
						duration: 5,
						status: "passed",
						error: undefined,
						assertions: [],
					},
				],
				duration: 15,
				status: "passed",
			},
		],
		totalTests: 2,
		passedTests: 2,
		failedTests: 0,
		skippedTests: 0,
		duration: 15,
		success: true,
	};

	describe("formatReport", () => {
		it("should format report as string", () => {
			const result = formatReport(mockReport);
			expect(result).toContainString("TEST REPORT");
			expect(result).toContainString("Total Tests: 2");
			expect(result).toContainString("✅ Passed: 2");
		});

		it("should include suite names", () => {
			const result = formatReport(mockReport);
			expect(result).toContainString("Math");
		});

		it("should include test names", () => {
			const result = formatReport(mockReport);
			expect(result).toContainString("should add");
			expect(result).toContainString("should subtract");
		});
	});

	describe("generateJsonReport", () => {
		it("should generate valid JSON", () => {
			const result = generateJsonReport(mockReport);
			const parsed = JSON.parse(result);
			expect(parsed.totalTests).toBe(2);
			expect(parsed.passedTests).toBe(2);
		});

		it("should include all report data", () => {
			const result = generateJsonReport(mockReport);
			expect(result).toContainString("Math");
			expect(result).toContainString("should add");
		});
	});

	describe("generateHtmlReport", () => {
		it("should generate valid HTML", () => {
			const result = generateHtmlReport(mockReport);
			expect(result).toContainString("<!DOCTYPE html>");
			expect(result).toContainString("Test Report");
		});

		it("should include test data", () => {
			const result = generateHtmlReport(mockReport);
			expect(result).toContainString("Total Tests: 2");
			expect(result).toContainString("Math");
		});
	});
});
