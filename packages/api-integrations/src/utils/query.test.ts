import { describe, expect, it } from "vitest";
import {
	buildQueryStringFromParams,
	conditionToFilterString,
	createQueryBuilder,
	parseSortString,
	queryOptionsToOData,
	queryOptionsToParams,
} from "./query";

describe("Query Utilities", () => {
	describe("createQueryBuilder", () => {
		it("should create query builder", () => {
			const builder = createQueryBuilder();
			expect(builder).toBeDefined();
			expect(builder.where).toBeDefined();
			expect(builder.sort).toBeDefined();
		});

		it("should build query with where clause", () => {
			const query = createQueryBuilder().where("name", "eq", "John").build();

			expect(query.filter).toBeDefined();
			expect(query.filter?.conditions).toHaveLength(1);
		});

		it("should build query with multiple conditions", () => {
			const query = createQueryBuilder()
				.where("name", "eq", "John")
				.and("age", "gt", 18)
				.build();

			expect(query.filter?.conditions).toHaveLength(2);
		});

		it("should build query with sort", () => {
			const query = createQueryBuilder()
				.sort("name", "asc")
				.sort("age", "desc")
				.build();

			expect(query.sort).toHaveLength(2);
			expect(query.sort?.[0]).toEqual({ field: "name", order: "asc" });
			expect(query.sort?.[1]).toEqual({ field: "age", order: "desc" });
		});

		it("should build query with pagination", () => {
			const query = createQueryBuilder().limit(10).offset(20).build();

			expect(query.limit).toBe(10);
			expect(query.offset).toBe(20);
		});

		it("should build query with select fields", () => {
			const query = createQueryBuilder().select("id", "name", "email").build();

			expect(query.fields).toEqual(["id", "name", "email"]);
		});

		it("should build query with expand", () => {
			const query = createQueryBuilder().expand("profile", "posts").build();

			expect(query.expand).toEqual(["profile", "posts"]);
		});
	});

	describe("conditionToFilterString", () => {
		it("should format eq condition", () => {
			const condition = {
				field: "name",
				operator: "eq" as const,
				value: "John",
			};
			expect(conditionToFilterString(condition)).toBe("name eq 'John'");
		});

		it("should format gt condition", () => {
			const condition = { field: "age", operator: "gt" as const, value: 18 };
			expect(conditionToFilterString(condition)).toBe("age gt 18");
		});

		it("should format contains condition", () => {
			const condition = {
				field: "name",
				operator: "contains" as const,
				value: "Jo",
			};
			expect(conditionToFilterString(condition)).toBe("contains(name, 'Jo')");
		});

		it("should format in condition", () => {
			const condition = {
				field: "status",
				operator: "in" as const,
				value: ["active", "pending"],
			};
			expect(conditionToFilterString(condition)).toBe(
				"status in ('active', 'pending')",
			);
		});
	});

	describe("queryOptionsToParams", () => {
		it("should convert query options to params", () => {
			const options = createQueryBuilder()
				.where("name", "eq", "John")
				.sort("age", "desc")
				.limit(10)
				.build();

			const params = queryOptionsToParams(options);

			expect(params["filter"]).toBeDefined();
			expect(params["sort"]).toBe("age:desc");
			expect(params["limit"]).toBe(10);
		});
	});

	describe("queryOptionsToOData", () => {
		it("should convert to OData format", () => {
			const options = createQueryBuilder()
				.where("name", "eq", "John")
				.sort("age", "desc")
				.limit(10)
				.offset(20)
				.build();

			const odata = queryOptionsToOData(options);

			expect(odata.$filter).toBeDefined();
			expect(odata.$orderby).toBe("age desc");
			expect(odata.$top).toBe(10);
			expect(odata.$skip).toBe(20);
		});
	});

	describe("buildQueryStringFromParams", () => {
		it("should build query string", () => {
			const params = { active: true, age: 30, name: "John" };
			const queryString = buildQueryStringFromParams(params);

			expect(queryString).toContain("name=John");
			expect(queryString).toContain("age=30");
			expect(queryString).toContain("active=true");
		});

		it("should handle array values", () => {
			const params = { tags: ["api", "auth"] };
			const queryString = buildQueryStringFromParams(params);

			expect(queryString).toContain("tags=api");
			expect(queryString).toContain("tags=auth");
		});
	});

	describe("parseSortString", () => {
		it("should parse sort string", () => {
			const sorts = parseSortString("name:asc,age:desc");

			expect(sorts).toHaveLength(2);
			expect(sorts[0]).toEqual({ field: "name", order: "asc" });
			expect(sorts[1]).toEqual({ field: "age", order: "desc" });
		});

		it("should default to asc order", () => {
			const sorts = parseSortString("name");

			expect(sorts).toHaveLength(1);
			expect(sorts[0]).toEqual({ field: "name", order: "asc" });
		});
	});
});
