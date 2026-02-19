/**
 * SQL Parser tests
 */
/* eslint-disable jest/no-conditional-expect */

import { describe, expect, it } from "vitest";
import { Result } from "../utils";
import { parseSQL } from "./sql.parser";

describe("SQL Parser", () => {
	it("should parse SELECT statement", () => {
		const query = "SELECT id, name, email FROM users WHERE active = true;";
		const result = parseSQL(query, "query.sql");
		expect(Result.isOk(result)).toBe(true);
		if (Result.isOk(result)) {
			expect(result.value.language).toBe("sql");
		}
	});

	it("should parse INSERT statement", () => {
		const query = "INSERT INTO users (name, email) VALUES ('John', 'john@example.com');";
		const result = parseSQL(query, "insert.sql");
		expect(Result.isOk(result)).toBe(true);
	});

	it("should parse UPDATE statement", () => {
		const query = "UPDATE users SET name = 'Jane' WHERE id = 1;";
		const result = parseSQL(query, "update.sql");
		expect(Result.isOk(result)).toBe(true);
	});

	it("should parse multiple statements", () => {
		const query = `
      SELECT * FROM users;
      INSERT INTO logs (action) VALUES ('query');
      UPDATE users SET last_login = NOW();
    `;
		const result = parseSQL(query, "multi.sql");
		expect(Result.isOk(result)).toBe(true);
		if (Result.isOk(result)) {
			expect(result.value.data.statements?.length).toBeGreaterThan(0);
		}
	});
});
