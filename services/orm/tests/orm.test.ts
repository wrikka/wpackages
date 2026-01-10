import { describe, expect, it } from "vitest";
import { SQLBuilder } from "../src/core/sql-builder";
import {
	createConditionBuilder,
	createDeleteBuilder,
	createInsertBuilder,
	createQueryBuilder,
	createUpdateBuilder,
} from "../src/query/query-builder";
import { defineTable } from "../src/schema/schema";

describe("ORM - Custom SQL Builder", () => {
	describe("SQLBuilder", () => {
		it("should build SELECT query", () => {
			const builder = new SQLBuilder("postgresql");
			const query = createQueryBuilder("users")
				.select("id", "name", "email")
				.where(createConditionBuilder().column("id").eq(1))
				.build();
			const sql = builder.build(query);
			expect(sql).toContain("SELECT");
			expect(sql).toContain("FROM \"users\"");
			expect(sql).toContain("WHERE (\"id\" = 1)");
		});

		it("should build INSERT query", () => {
			const builder = new SQLBuilder("postgresql");
			const query = createInsertBuilder("users")
				.values({ name: "John", email: "john@example.com" })
				.build();
			const sql = builder.build(query);
			expect(sql).toContain('INSERT INTO "users"');
			expect(sql).toContain("VALUES");
		});

		it("should build UPDATE query", () => {
			const builder = new SQLBuilder("postgresql");
			const query = createUpdateBuilder("users")
				.set({ name: "Jane" })
				.where(createConditionBuilder().column("id").eq(1))
				.build();
			const sql = builder.build(query);
			expect(sql).toContain('UPDATE "users"');
			expect(sql).toContain("SET");
			expect(sql).toContain('WHERE ("id" = 1)');
		});

		it("should build DELETE query", () => {
			const builder = new SQLBuilder("postgresql");
			const query = createDeleteBuilder("users")
				.where(createConditionBuilder().column("id").eq(1))
				.build();
			const sql = builder.build(query);
			expect(sql).toContain("DELETE FROM \"users\"");
			expect(sql).toContain("WHERE (\"id\" = 1)");
		});
	});

	describe("Schema Builder", () => {
		it("should build table schema", () => {
			const table = defineTable("users")
				.int("id").primaryKey().autoIncrement()
				.varchar("name", 255).notNull()
				.varchar("email", 255).unique()
				.timestamp("createdAt").default("CURRENT_TIMESTAMP")
				.build();

			expect(table.name).toBe("users");
			expect(table.schema.id).toBeDefined();
			expect(table.schema.id.primaryKey).toBe(true);
			expect(table.schema.name).toBeDefined();
		});
	});

	describe("Query Builder", () => {
		it("should build complex SELECT with joins", () => {
			const builder = new SQLBuilder("postgresql");
			const query = createQueryBuilder("users")
				.select("users.id", "users.name", "posts.title")
				.join("posts", createConditionBuilder().column("users.id").eq(createConditionBuilder().column("posts.userId")))
				.where(createConditionBuilder().column("users.id").eq(1))
				.orderBy("users.name", "ASC")
				.limit(10)
				.build();
			const sql = builder.build(query);
			expect(sql).toContain("INNER JOIN");
			expect(sql).toContain("ORDER BY");
			expect(sql).toContain("LIMIT");
		});
	});
});
