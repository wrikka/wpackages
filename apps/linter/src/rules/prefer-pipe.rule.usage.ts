/**
 * Usage examples for prefer-pipe rule
 */

// Simple pipe implementation for examples
const pipe = <T>(value: T, ...fns: Array<(x: any) => any>): any =>
	fns.reduce((acc, fn) => fn(acc), value);

// ❌ Bad - Nested function calls (hard to read)
const result1 = JSON.stringify(
	Object.values(Object.fromEntries(Object.entries({ a: 1, b: 2 }))),
);

// ✅ Good - Using pipe (easier to read)
const result2 = pipe(
	{ a: 1, b: 2 },
	(data) => Object.entries(data),
	(data) => Object.fromEntries(data),
	(data) => Object.values(data),
	(data) => JSON.stringify(data),
);

// Example functions
const removeSpaces = (s: string) => s.replace(/\s/g, "");
const trim = (s: string) => s.trim();
const toUpperCase = (s: string) => s.toUpperCase();
const parseJSON = (s: string) => JSON.parse(s);
const mapToUsers = (data: { users: unknown[] }) => data.users;
const filterActive = (users: { active: boolean }[]) => users.filter((u) => u.active);

// ❌ Bad - Multiple nested calls
const result3 = toUpperCase(trim(removeSpaces("input")));

// ✅ Good - Using pipe
const result4 = pipe(
	"input",
	(data) => removeSpaces(data),
	(data) => trim(data),
	(data) => toUpperCase(data),
);

// Note: Simple one or two level nesting is OK
const ok1 = trim("input"); // ✅ Simple
const ok2 = toUpperCase(trim("input")); // ✅ Still readable

// But three or more levels should use pipe
const notOk = toUpperCase(trim(removeSpaces("input"))); // ❌ Use pipe!

// Export for examples
export { result1, result2, result3, result4, ok1, ok2, notOk, parseJSON, mapToUsers, filterActive };

