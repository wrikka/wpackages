import { describe, expect, it } from "vitest";
import {
	buildCursorPagination,
	buildOffsetPagination,
	buildPagePagination,
	getNextOffsetPagination,
	getNextPagePagination,
	getPrevOffsetPagination,
	getPrevPagePagination,
	isValidPaginationConfig,
	offsetToPage,
	pageToOffset,
	paginationToQueryParams,
} from "./pagination";

describe("Pagination Utilities", () => {
	describe("buildOffsetPagination", () => {
		it("should build offset pagination with defaults", () => {
			const pagination = buildOffsetPagination();

			expect(pagination.type).toBe("offset");
			expect(pagination.offset).toBe(0);
			expect(pagination.limit).toBe(50);
		});

		it("should build offset pagination with custom values", () => {
			const pagination = buildOffsetPagination(100, 25);

			expect(pagination.offset).toBe(100);
			expect(pagination.limit).toBe(25);
		});
	});

	describe("buildCursorPagination", () => {
		it("should build cursor pagination without cursor", () => {
			const pagination = buildCursorPagination();

			expect(pagination.type).toBe("cursor");
			expect(pagination.limit).toBe(50);
			expect(pagination.cursor).toBeUndefined();
		});

		it("should build cursor pagination with cursor", () => {
			const pagination = buildCursorPagination(25, "abc123");

			expect(pagination.limit).toBe(25);
			expect(pagination.cursor).toBe("abc123");
		});
	});

	describe("buildPagePagination", () => {
		it("should build page pagination with defaults", () => {
			const pagination = buildPagePagination();

			expect(pagination.type).toBe("page");
			expect(pagination.page).toBe(1);
			expect(pagination.perPage).toBe(50);
		});

		it("should build page pagination with custom values", () => {
			const pagination = buildPagePagination(3, 25);

			expect(pagination.page).toBe(3);
			expect(pagination.perPage).toBe(25);
		});
	});

	describe("pageToOffset", () => {
		it("should convert page to offset", () => {
			expect(pageToOffset(1, 50)).toBe(0);
			expect(pageToOffset(2, 50)).toBe(50);
			expect(pageToOffset(3, 25)).toBe(50);
		});
	});

	describe("offsetToPage", () => {
		it("should convert offset to page", () => {
			expect(offsetToPage(0, 50)).toBe(1);
			expect(offsetToPage(50, 50)).toBe(2);
			expect(offsetToPage(100, 50)).toBe(3);
		});
	});

	describe("getNextOffsetPagination", () => {
		it("should get next offset pagination", () => {
			const current = buildOffsetPagination(0, 50);
			const next = getNextOffsetPagination(current);

			expect(next.offset).toBe(50);
			expect(next.limit).toBe(50);
		});
	});

	describe("getPrevOffsetPagination", () => {
		it("should get previous offset pagination", () => {
			const current = buildOffsetPagination(100, 50);
			const prev = getPrevOffsetPagination(current);

			expect(prev.offset).toBe(50);
		});

		it("should not go below zero", () => {
			const current = buildOffsetPagination(25, 50);
			const prev = getPrevOffsetPagination(current);

			expect(prev.offset).toBe(0);
		});
	});

	describe("getNextPagePagination", () => {
		it("should get next page", () => {
			const current = buildPagePagination(2, 50);
			const next = getNextPagePagination(current);

			expect(next.page).toBe(3);
		});
	});

	describe("getPrevPagePagination", () => {
		it("should get previous page", () => {
			const current = buildPagePagination(3, 50);
			const prev = getPrevPagePagination(current);

			expect(prev.page).toBe(2);
		});

		it("should not go below page 1", () => {
			const current = buildPagePagination(1, 50);
			const prev = getPrevPagePagination(current);

			expect(prev.page).toBe(1);
		});
	});

	describe("paginationToQueryParams", () => {
		it("should convert offset pagination to params", () => {
			const pagination = buildOffsetPagination(50, 25);
			const params = paginationToQueryParams(pagination);

			expect(params["offset"]).toBe(50);
			expect(params["limit"]).toBe(25);
		});

		it("should convert cursor pagination to params", () => {
			const pagination = buildCursorPagination(25, "abc123");
			const params = paginationToQueryParams(pagination);

			expect(params["limit"]).toBe(25);
			expect(params["cursor"]).toBe("abc123");
		});

		it("should convert page pagination to params", () => {
			const pagination = buildPagePagination(3, 25);
			const params = paginationToQueryParams(pagination);

			expect(params["page"]).toBe(3);
			expect(params["per_page"]).toBe(25);
		});
	});

	describe("isValidPaginationConfig", () => {
		it("should validate offset pagination", () => {
			expect(isValidPaginationConfig(buildOffsetPagination(0, 50))).toBe(true);
			expect(
				isValidPaginationConfig({ limit: 50, offset: -1, type: "offset" }),
			).toBe(false);
			expect(
				isValidPaginationConfig({ limit: 0, offset: 0, type: "offset" }),
			).toBe(false);
		});

		it("should validate cursor pagination", () => {
			expect(isValidPaginationConfig(buildCursorPagination(50))).toBe(true);
			expect(isValidPaginationConfig({ limit: 0, type: "cursor" })).toBe(false);
		});

		it("should validate page pagination", () => {
			expect(isValidPaginationConfig(buildPagePagination(1, 50))).toBe(true);
			expect(
				isValidPaginationConfig({ page: 0, perPage: 50, type: "page" }),
			).toBe(false);
			expect(
				isValidPaginationConfig({ page: 1, perPage: 0, type: "page" }),
			).toBe(false);
		});
	});
});
