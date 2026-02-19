# Combinators Guide

## Overview

Combinators คือ functions ที่ใช้สำหรับ compose effects ร่วมกัน

## Available Combinators

### map

Transform ค่าของ effect:

```typescript
import { map, pipe, runPromise, succeed } from "@wpackages/effect";

const effect = succeed(1);
const doubled = pipe(effect, map((x) => x * 2));

const result = await runPromise(doubled);
console.log(result.value); // 2
```

### flatMap / andThen / chain

Compose effects แบบ sequential:

```typescript
import { flatMap, pipe, runPromise, succeed } from "@wpackages/effect";

const effect = succeed(1);
const added = pipe(
	effect,
	flatMap((x) => succeed(x + 10)),
);

const result = await runPromise(added);
console.log(result.value); // 11
```

### tap

Execute side effect โดยไม่เปลี่ยนค่า:

```typescript
import { pipe, runPromise, succeed, tap } from "@wpackages/effect";

const effect = succeed(1);
const logged = pipe(
	effect,
	tap((x) => console.log("Value:", x)),
);

const result = await runPromise(logged);
console.log(result.value); // 1
```

### bind

Add property ไปยัง object:

```typescript
import { bind, pipe, runPromise, succeed } from "@wpackages/effect";

const effect = succeed({ a: 1 });
const withB = pipe(
	effect,
	bind("b", () => succeed(2)),
);

const result = await runPromise(withB);
console.log(result.value); // { a: 1, b: 2 }
```

### pipe

Chain multiple operations:

```typescript
import { flatMap, map, pipe, runPromise, succeed } from "@wpackages/effect";

const result = await runPromise(
	pipe(
		succeed(1),
		map((x) => x * 2),
		flatMap((x) => succeed(x + 10)),
		map((x) => x / 2),
	),
);
console.log(result.value); // 6
```

### all

Run multiple effects พร้อมกัน:

```typescript
import { all, runPromise, succeed } from "@wpackages/effect";

const result = await runPromise(
	all([succeed(1), succeed(2), succeed(3)]),
);
console.log(result.value); // [1, 2, 3]
```

### allSuccesses

Run effects และ return เฉพาะ successes:

```typescript
import { allSuccesses, fail, runPromise, succeed } from "@wpackages/effect";

const result = await runPromise(
	allSuccesses([
		succeed(1),
		fail({ message: "Error" }),
		succeed(3),
	]),
);
console.log(result.value); // [1, 3]
```

### forEach

Apply effect ไปยังทุก item:

```typescript
import { forEach, runPromise, succeed } from "@wpackages/effect";

const items = [1, 2, 3];
const result = await runPromise(
	forEach((x) => succeed(x * 2))(items),
);
console.log(result.value); // [2, 4, 6]
```

### race

Return result จาก effect ที่เสร็จก่อน:

```typescript
import { race, runPromise, sleep, succeed } from "@wpackages/effect";

const result = await runPromise(
	race([
		succeed(1),
		pipe(sleep(1000), () => succeed(2)),
	]),
);
console.log(result.value); // 1
```

### raceAll

Return result จาก effect ที่เสร็จสำเร็จที่สุด:

```typescript
import { fail, raceAll, runPromise, sleep } from "@wpackages/effect";

const result = await runPromise(
	raceAll([
		pipe(sleep(100), () => fail({ message: "Error" })),
		succeed(1),
	]),
);
console.log(result.value); // 1
```

## Chaining Examples

### Sequential Operations

```typescript
import { gen, succeed, tryPromise } from "@wpackages/effect";

const program = gen(function*() {
	const user = yield* tryPromise(() => fetchUser(1), (e) => e);
	const posts = yield* tryPromise(() => fetchPosts(user.id), (e) => e);
	const comments = yield* tryPromise(
		() => fetchComments(posts[0].id),
		(e) => e,
	);
	return succeed({ user, posts, comments });
});
```

### Parallel Operations

```typescript
import { all, tryPromise } from "@wpackages/effect";

const program = all([
	tryPromise(() => fetchUser(1), (e) => e),
	tryPromise(() => fetchPosts(1), (e) => e),
	tryPromise(() => fetchComments(1), (e) => e),
]);
```

### Mixed Operations

```typescript
import { all, gen, succeed, tryPromise } from "@wpackages/effect";

const program = gen(function*() {
	const user = yield* tryPromise(() => fetchUser(1), (e) => e);
	const [posts, comments] = yield* all([
		tryPromise(() => fetchPosts(user.id), (e) => e),
		tryPromise(() => fetchComments(user.id), (e) => e),
	]);
	return succeed({ user, posts, comments });
});
```

## Error Handling with Combinators

### Recover from Errors

```typescript
import { fail, map, pipe, runPromise } from "@wpackages/effect";

const effect = fail({ message: "Error" });
const recovered = pipe(
	effect,
	map((error) => ({ message: error.message, recovered: true })),
);

const result = await runPromise(recovered);
console.log(result.value); // { message: "Error", recovered: true }
```

### Provide Default Value

```typescript
import { fail, map, pipe, runPromise } from "@wpackages/effect";

const effect = fail({ message: "Error" });
const withDefault = pipe(
	effect,
	map(() => 42),
);

const result = await runPromise(withDefault);
console.log(result.value); // 42
```
