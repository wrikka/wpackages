/**
 * Usage examples for prefer-pipe rule
 */

// Simple pipe implementation for examples
function pipe<A>(a: A): A;
function pipe<A, B>(a: A, ab: (a: A) => B): B;
function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
function pipe<A, B, C, D>(
	a: A,
	ab: (a: A) => B,
	bc: (b: B) => C,
	cd: (c: C) => D,
): D;
function pipe<A, B, C, D, E>(
	a: A,
	ab: (a: A) => B,
	bc: (b: B) => C,
	cd: (c: C) => D,
	de: (d: D) => E,
): E;
function pipe<A, B, C, D, E, F>(
	a: A,
	ab: (a: A) => B,
	bc: (b: B) => C,
	cd: (c: C) => D,
	de: (d: D) => E,
	ef: (e: E) => F,
): F;
function pipe(
	value: unknown,
	...fns: ReadonlyArray<(x: unknown) => unknown>
): unknown {
	return fns.reduce((acc, fn) => fn(acc), value);
}

// ❌ Bad - Nested function calls (hard to read)
const result1 = JSON.stringify(
	Object.values(Object.fromEntries(Object.entries({ a: 1, b: 2 }))),
);

// ✅ Good - Using pipe (easier to read)
const result2 = pipe(
	{ a: 1, b: 2 },
	(data: { readonly a: number; readonly b: number }) => Object.entries(data),
	(entries: ReadonlyArray<readonly [string, number]>) => Object.fromEntries(entries),
	(obj: Record<string, number>) => Object.values(obj),
	(values: ReadonlyArray<number>) => JSON.stringify(values),
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
export { filterActive, mapToUsers, notOk, ok1, ok2, parseJSON, result1, result2, result3, result4 };
