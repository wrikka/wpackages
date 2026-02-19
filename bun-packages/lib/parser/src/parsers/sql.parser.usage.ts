/**
 * SQL Parser - Usage Examples
 */

import { Result } from "../utils";
import { parseSQL } from "./sql.parser";

// Example 1: Parse SELECT query
const selectQuery = `
  SELECT id, name, email, created_at
  FROM users
  WHERE active = true
  ORDER BY created_at DESC
  LIMIT 10;
`;

const result = parseSQL(selectQuery, "select.sql");
if (Result.isOk(result)) {
	console.log("Language:", result.value.language);
	const data = result.value.data as Record<string, unknown>;
	console.log("Statements:", (data["statements"] as unknown[])?.length);
}

// Example 2: Parse INSERT query
const insertQuery = `
  INSERT INTO users (name, email, created_at)
  VALUES ('John Doe', 'john@example.com', NOW());
`;

const insertResult = parseSQL(insertQuery, "insert.sql");
console.log("Insert parsed:", Result.isOk(insertResult));

// Example 3: Parse complex query
const complexQuery = `
  SELECT u.id, u.name, COUNT(p.id) as post_count
  FROM users u
  LEFT JOIN posts p ON u.id = p.user_id
  WHERE u.active = true
  GROUP BY u.id, u.name
  HAVING COUNT(p.id) > 5;
`;

const complexResult = parseSQL(complexQuery, "complex.sql");
console.log("Complex query parsed:", Result.isOk(complexResult));
