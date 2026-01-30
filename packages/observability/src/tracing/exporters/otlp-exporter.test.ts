import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Span } from "../types/tracing";
import { OTLPSpanExporter } from "./otlp-exporter";

describe("OTLPSpanExporter", () => {
	let exporter: OTLPSpanExporter;
	let mockFetch: ReturnType<typeof vi.fn>;
	let mockResource = {
		attributes: {
			"service.name": "test-service",
			"service.version": "1.0.0",
		},
	};

	beforeEach(() => {
		mockFetch = vi.fn();
		global.fetch = mockFetch as any;
		exporter = new OTLPSpanExporter(
			{
				url: "http://localhost:4318/v1/traces",
			},
			mockResource,
		);
	});

	it("should create exporter with default config", () => {
		expect(exporter).toBeDefined();
	});

	it("should export spans successfully", async () => {
		const mockSpan: Span = {
			traceId: "test-trace-id",
			spanId: "test-span-id",
			parentId: undefined,
			name: "test-span",
			startTime: Date.now(),
			endTime: Date.now() + 100,
			status: "ok",
			attributes: { "key": "value", "number": 42 },
			events: [],
			links: [],
			resource: mockResource as any,
		};

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: async () => "",
		});

		await exporter.export([mockSpan]);

		expect(mockFetch).toHaveBeenCalledTimes(1);
		expect(mockFetch).toHaveBeenCalledWith(
			"http://localhost:4318/v1/traces",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					"Content-Type": "application/x-protobuf",
				}),
			}),
		);
	});

	it("should retry on failure", async () => {
		const mockSpan: Span = {
			traceId: "test-trace-id",
			spanId: "test-span-id",
			parentId: undefined,
			name: "test-span",
			startTime: Date.now(),
			endTime: Date.now() + 100,
			status: "ok",
			attributes: {},
			events: [],
			links: [],
			resource: mockResource as any,
		};

		mockFetch
			.mockRejectedValueOnce(new Error("Network error"))
			.mockRejectedValueOnce(new Error("Network error"))
			.mockResolvedValueOnce({
				ok: true,
				text: async () => "",
			});

		await exporter.export([mockSpan]);

		expect(mockFetch).toHaveBeenCalledTimes(3);
	});

	it("should throw error after max retries", async () => {
		const mockSpan: Span = {
			traceId: "test-trace-id",
			spanId: "test-span-id",
			parentId: undefined,
			name: "test-span",
			startTime: Date.now(),
			endTime: Date.now() + 100,
			status: "ok",
			attributes: {},
			events: [],
			links: [],
			resource: mockResource as any,
		};

		mockFetch.mockRejectedValue(new Error("Network error"));

		await expect(exporter.export([mockSpan])).rejects.toThrow("OTLP export failed after 3 retries");
	}, 15000);

	it("should not export when shutdown", async () => {
		const mockSpan: Span = {
			traceId: "test-trace-id",
			spanId: "test-span-id",
			parentId: undefined,
			name: "test-span",
			startTime: Date.now(),
			endTime: Date.now() + 100,
			status: "ok",
			attributes: {},
			events: [],
			links: [],
			resource: mockResource as any,
		};

		await exporter.shutdown();

		await exporter.export([mockSpan]);

		expect(mockFetch).not.toHaveBeenCalled();
	});

	it("should handle empty spans array", async () => {
		await exporter.export([]);

		expect(mockFetch).not.toHaveBeenCalled();
	});

	it("should convert span attributes correctly", async () => {
		const mockSpan: Span = {
			traceId: "test-trace-id",
			spanId: "test-span-id",
			parentId: undefined,
			name: "test-span",
			startTime: Date.now(),
			endTime: Date.now() + 100,
			status: "ok",
			attributes: {
				string: "value",
				number: 42,
				float: 3.14,
				bool: true,
				null: null,
				array: [1, 2, 3],
				object: { nested: "value" },
			},
			events: [],
			links: [],
			resource: mockResource as any,
		};

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: async () => "",
		});

		await exporter.export([mockSpan]);

		const callArgs = mockFetch.mock.calls[0];
		const body = JSON.parse(callArgs[1].body);

		expect(body.resourceSpans[0].instrumentationLibrarySpans[0].spans[0].attributes).toBeDefined();
	});

	it("should apply custom headers", async () => {
		const customExporter = new OTLPSpanExporter(
			{
				url: "http://localhost:4318/v1/traces",
				headers: {
					"X-Custom-Header": "custom-value",
				},
			},
			mockResource,
		);

		const mockSpan: Span = {
			traceId: "test-trace-id",
			spanId: "test-span-id",
			parentId: undefined,
			name: "test-span",
			startTime: Date.now(),
			endTime: Date.now() + 100,
			status: "ok",
			attributes: {},
			events: [],
			links: [],
			resource: mockResource as any,
		};

		mockFetch.mockResolvedValueOnce({
			ok: true,
			text: async () => "",
		});

		await customExporter.export([mockSpan]);

		const callArgs = mockFetch.mock.calls[0];
		expect(callArgs[1].headers["X-Custom-Header"]).toBe("custom-value");
	});
});
