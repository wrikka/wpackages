import { describe, it, expect } from "vitest";
import { SearchQuerySchema } from "../types";
import { buildQueryParams, buildGoogleQuery, buildBingQuery } from "./query-builder";

describe("QueryBuilder", () => {
  it("should build basic query params", () => {
    const query = SearchQuerySchema.parse({
      query: "test",
      engines: ["google"],
    });

    const params = buildQueryParams(query, "google");
    expect(params.q).toBe("test");
    expect(params.hl).toBe("en");
    expect(params.gl).toBe("us");
  });

  it("should build Google query with site filter", () => {
    const query = SearchQuerySchema.parse({
      query: "test",
      engines: ["google"],
      siteFilter: "example.com",
    });

    const built = buildGoogleQuery(query);
    expect(built).toContain("site:example.com");
  });

  it("should build Google query with time range", () => {
    const query = SearchQuerySchema.parse({
      query: "test",
      engines: ["google"],
      timeRange: "day",
    });

    const built = buildGoogleQuery(query);
    expect(built).toContain("after:");
  });

  it("should build Google query with exclude domains", () => {
    const query = SearchQuerySchema.parse({
      query: "test",
      engines: ["google"],
      excludeDomains: ["spam.com"],
    });

    const built = buildGoogleQuery(query);
    expect(built).toContain("-site:spam.com");
  });

  it("should build Bing query with site filter", () => {
    const query = SearchQuerySchema.parse({
      query: "test",
      engines: ["bing"],
      siteFilter: "example.com",
    });

    const built = buildBingQuery(query);
    expect(built).toContain("site:example.com");
  });
});
