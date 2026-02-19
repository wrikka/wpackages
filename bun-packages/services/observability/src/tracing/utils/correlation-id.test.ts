import { beforeEach, describe, expect, it } from "vitest";
import {
	clearCorrelationId,
	extractCorrelationIdFromHeaders,
	generateCorrelationId,
	getCorrelationId,
	getCorrelationIdHeader,
	injectCorrelationIdToHeaders,
	setCorrelationId,
	withCorrelationId,
} from "./correlation-id";

describe("correlation-id", () => {
	beforeEach(() => {
		clearCorrelationId();
	});

	describe("generateCorrelationId", () => {
		it("should generate a correlation ID", () => {
			const id = generateCorrelationId();
			expect(id).toBeDefined();
			expect(typeof id).toBe("string");
		});

		it("should generate unique IDs", () => {
			const id1 = generateCorrelationId();
			const id2 = generateCorrelationId();
			expect(id1).not.toBe(id2);
		});
	});

	describe("setCorrelationId", () => {
		it("should set correlation ID", () => {
			setCorrelationId("test-id");
			expect(getCorrelationId()).toBe("test-id");
		});
	});

	describe("getCorrelationId", () => {
		it("should return undefined when not set", () => {
			expect(getCorrelationId()).toBeUndefined();
		});

		it("should return the set correlation ID", () => {
			setCorrelationId("test-id");
			expect(getCorrelationId()).toBe("test-id");
		});
	});

	describe("clearCorrelationId", () => {
		it("should clear correlation ID", () => {
			setCorrelationId("test-id");
			clearCorrelationId();
			expect(getCorrelationId()).toBeUndefined();
		});
	});

	describe("withCorrelationId", () => {
		it("should execute function with correlation ID", () => {
			let capturedId: string | undefined;
			withCorrelationId("scoped-id", () => {
				capturedId = getCorrelationId();
			});
			expect(capturedId).toBe("scoped-id");
		});

		it("should restore previous correlation ID after execution", () => {
			setCorrelationId("original-id");
			withCorrelationId("scoped-id", () => {});
			expect(getCorrelationId()).toBe("original-id");
		});

		it("should clear correlation ID if none was set before", () => {
			withCorrelationId("scoped-id", () => {});
			expect(getCorrelationId()).toBeUndefined();
		});

		it("should return function result", () => {
			const result = withCorrelationId("scoped-id", () => 42);
			expect(result).toBe(42);
		});
	});

	describe("getCorrelationIdHeader", () => {
		it("should return the correlation ID header name", () => {
			expect(getCorrelationIdHeader()).toBe("X-Correlation-ID");
		});
	});

	describe("extractCorrelationIdFromHeaders", () => {
		it("should extract correlation ID from headers", () => {
			const headers = { "X-Correlation-ID": "test-id" };
			expect(extractCorrelationIdFromHeaders(headers)).toBe("test-id");
		});

		it("should extract from array header", () => {
			const headers = { "X-Correlation-ID": ["test-id"] };
			expect(extractCorrelationIdFromHeaders(headers)).toBe("test-id");
		});

		it("should return undefined when header not present", () => {
			const headers = {};
			expect(extractCorrelationIdFromHeaders(headers)).toBeUndefined();
		});
	});

	describe("injectCorrelationIdToHeaders", () => {
		it("should inject correlation ID into headers", () => {
			const headers = {};
			const result = injectCorrelationIdToHeaders(headers);
			expect(result["X-Correlation-ID"]).toBeDefined();
		});

		it("should use existing correlation ID if set", () => {
			setCorrelationId("existing-id");
			const headers = {};
			const result = injectCorrelationIdToHeaders(headers);
			expect(result["X-Correlation-ID"]).toBe("existing-id");
		});

		it("should preserve existing headers", () => {
			const headers = { "Content-Type": "application/json" };
			const result = injectCorrelationIdToHeaders(headers);
			expect(result["Content-Type"]).toBe("application/json");
			expect(result["X-Correlation-ID"]).toBeDefined();
		});
	});
});
