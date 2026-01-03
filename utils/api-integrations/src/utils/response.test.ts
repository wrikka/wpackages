import { describe, expect, it } from "vitest";
import type { Response } from "../types";
import {
	buildCursorPaginationMetadata,
	buildOffsetPaginationMetadata,
	buildPagePaginationMetadata,
	buildPaginatedResponse,
	calculateTotalPages,
	extractData,
	extractNextPageUrl,
	extractPrevPageUrl,
	hasMorePages,
	isClientError,
	isServerError,
	isSuccessResponse,
	parseLinkHeader,
	transformResponse,
} from "./response";

describe("Response Utilities", () => {
	describe("isSuccessResponse", () => {
		it("should identify success status codes", () => {
			expect(isSuccessResponse(200)).toBe(true);
			expect(isSuccessResponse(201)).toBe(true);
			expect(isSuccessResponse(204)).toBe(true);
			expect(isSuccessResponse(299)).toBe(true);
		});

		it("should identify non-success status codes", () => {
			expect(isSuccessResponse(199)).toBe(false);
			expect(isSuccessResponse(300)).toBe(false);
			expect(isSuccessResponse(400)).toBe(false);
			expect(isSuccessResponse(500)).toBe(false);
		});
	});

	describe("isClientError", () => {
		it("should identify client error codes", () => {
			expect(isClientError(400)).toBe(true);
			expect(isClientError(404)).toBe(true);
			expect(isClientError(499)).toBe(true);
		});

		it("should identify non-client errors", () => {
			expect(isClientError(200)).toBe(false);
			expect(isClientError(500)).toBe(false);
		});
	});

	describe("isServerError", () => {
		it("should identify server error codes", () => {
			expect(isServerError(500)).toBe(true);
			expect(isServerError(503)).toBe(true);
			expect(isServerError(599)).toBe(true);
		});

		it("should identify non-server errors", () => {
			expect(isServerError(200)).toBe(false);
			expect(isServerError(400)).toBe(false);
		});
	});

	describe("extractData", () => {
		it("should extract data from response", () => {
			const response: Response<{ name: string }> = {
				data: { name: "John" },
				duration: 100,
				headers: {},
				status: 200,
				statusText: "OK",
				url: "https://api.example.com",
			};

			expect(extractData(response)).toEqual({ name: "John" });
		});
	});

	describe("transformResponse", () => {
		it("should transform response data", () => {
			const response: Response<{ name: string }> = {
				data: { name: "John" },
				duration: 100,
				headers: {},
				status: 200,
				statusText: "OK",
				url: "https://api.example.com",
			};

			const transformed = transformResponse(response, (data) => data.name.toUpperCase());

			expect(transformed.data).toBe("JOHN");
			expect(transformed.status).toBe(200);
		});
	});

	describe("buildPaginatedResponse", () => {
		it("should build paginated response", () => {
			const data = [{ id: 1 }, { id: 2 }];
			const pagination = {
				hasNext: true,
				hasPrev: false,
				total: 100,
			};

			const result = buildPaginatedResponse(data, pagination);

			expect(result.data).toEqual(data);
			expect(result.pagination).toEqual(pagination);
		});
	});

	describe("buildOffsetPaginationMetadata", () => {
		it("should build offset pagination metadata", () => {
			const metadata = buildOffsetPaginationMetadata(100, 0, 20);

			expect(metadata.total).toBe(100);
			expect(metadata.hasNext).toBe(true);
			expect(metadata.hasPrev).toBe(false);
			expect(metadata.currentPage).toBe(1);
			expect(metadata.totalPages).toBe(5);
		});

		it("should handle middle page", () => {
			const metadata = buildOffsetPaginationMetadata(100, 40, 20);

			expect(metadata.hasNext).toBe(true);
			expect(metadata.hasPrev).toBe(true);
			expect(metadata.currentPage).toBe(3);
		});
	});

	describe("buildCursorPaginationMetadata", () => {
		it("should build cursor pagination metadata", () => {
			const metadata = buildCursorPaginationMetadata(
				true,
				false,
				"next123",
				"prev456",
			);

			expect(metadata.hasNext).toBe(true);
			expect(metadata.hasPrev).toBe(false);
			expect(metadata.nextCursor).toBe("next123");
			expect(metadata.prevCursor).toBe("prev456");
		});

		it("should build without cursors", () => {
			const metadata = buildCursorPaginationMetadata(false, false);

			expect(metadata.hasNext).toBe(false);
			expect(metadata.hasPrev).toBe(false);
			expect(metadata.nextCursor).toBeUndefined();
			expect(metadata.prevCursor).toBeUndefined();
		});
	});

	describe("buildPagePaginationMetadata", () => {
		it("should build page pagination metadata", () => {
			const metadata = buildPagePaginationMetadata(100, 2, 20);

			expect(metadata.total).toBe(100);
			expect(metadata.hasNext).toBe(true);
			expect(metadata.hasPrev).toBe(true);
			expect(metadata.currentPage).toBe(2);
			expect(metadata.totalPages).toBe(5);
		});
	});

	describe("parseLinkHeader", () => {
		it("should parse Link header", () => {
			const linkHeader =
				"<https://api.example.com?page=2>; rel=\"next\", <https://api.example.com?page=1>; rel=\"prev\"";
			const links = parseLinkHeader(linkHeader);

			expect(links["next"]).toBe("https://api.example.com?page=2");
			expect(links["prev"]).toBe("https://api.example.com?page=1");
		});
	});

	describe("extractNextPageUrl", () => {
		it("should extract next page URL", () => {
			const linkHeader = "<https://api.example.com?page=2>; rel=\"next\"";
			const nextUrl = extractNextPageUrl(linkHeader);

			expect(nextUrl).toBe("https://api.example.com?page=2");
		});

		it("should return undefined for no Link header", () => {
			expect(extractNextPageUrl(undefined)).toBeUndefined();
		});
	});

	describe("extractPrevPageUrl", () => {
		it("should extract prev page URL", () => {
			const linkHeader = "<https://api.example.com?page=1>; rel=\"prev\"";
			const prevUrl = extractPrevPageUrl(linkHeader);

			expect(prevUrl).toBe("https://api.example.com?page=1");
		});
	});

	describe("hasMorePages", () => {
		it("should check if has more pages", () => {
			expect(hasMorePages({ hasNext: true, hasPrev: false })).toBe(true);
			expect(hasMorePages({ hasNext: false, hasPrev: true })).toBe(false);
		});
	});

	describe("calculateTotalPages", () => {
		it("should calculate total pages", () => {
			expect(calculateTotalPages(100, 20)).toBe(5);
			expect(calculateTotalPages(101, 20)).toBe(6);
			expect(calculateTotalPages(0, 20)).toBe(0);
		});
	});
});
