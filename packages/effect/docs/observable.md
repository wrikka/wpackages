# Observable Pattern Guide

## Overview

Observable pattern ช่วยให้คุณ work with async data streams ใน reactive way

## Creating Observables

### From Promise

```typescript
import { fromPromise } from "@wpackages/effect/observable";

const observable = fromPromise(Promise.resolve(42));

observable.subscribe({
  next: (value) => console.log("Received:", value),
  error: (error) => console.error("Error:", error),
  complete: () => console.log("Completed"),
});
```

### From Event

```typescript
import { fromEvent } from "@wpackages/effect/observable";

const button = document.querySelector("button");
const clickObservable = fromEvent(button, "click");

clickObservable.subscribe({
  next: (event) => console.log("Clicked:", event),
  error: (error) => console.error("Error:", error),
  complete: () => console.log("Completed"),
});
```

### Custom Observable

```typescript
import { createObservable } from "@wpackages/effect/observable";

const observable = createObservable((observer) => {
  let count = 0;
  const interval = setInterval(() => {
    observer.next(count++);
    if (count >= 10) {
      observer.complete();
      clearInterval(interval);
    }
  }, 100);

  return () => {
    clearInterval(interval);
    console.log("Cleaned up");
  };
});

observable.subscribe({
  next: (value) => console.log("Received:", value),
  error: (error) => console.error("Error:", error),
  complete: () => console.log("Completed"),
});
```

## Observable Operators

### map

Transform values:

```typescript
import { fromPromise, map } from "@wpackages/effect/observable";

const observable = fromPromise(Promise.resolve(1));
const doubled = map((x) => x * 2)(observable);
```

### filter

Filter values:

```typescript
import { fromPromise, filter } from "@wpackages/effect/observable";

const observable = fromPromise(Promise.resolve(1));
const filtered = filter((x) => x > 0)(observable);
```

### tap

Side effect without changing values:

```typescript
import { fromPromise, tap } from "@wpackages/effect/observable";

const observable = fromPromise(Promise.resolve(1));
const logged = tap((x) => console.log("Value:", x))(observable);
```

### take

Take first n values:

```typescript
import { createObservable, take } from "@wpackages/effect/observable";

const observable = createObservable((observer) => {
  let count = 0;
  const interval = setInterval(() => {
    observer.next(count++);
  }, 100);
  return () => clearInterval(interval);
});

const firstFive = take(5)(observable);
```

### debounceTime

Debounce emissions:

```typescript
import { fromEvent, debounceTime } from "@wpackages/effect/observable";

const input = document.querySelector("input");
const inputObservable = fromEvent(input, "input");
const debounced = debounceTime(300)(inputObservable);
```

## Subjects

### Subject

Basic subject that multicasts to multiple observers:

```typescript
import { createSubject } from "@wpackages/effect/observable";

const subject = createSubject<number>();

const subscription1 = subject.subscribe({
  next: (value) => console.log("Observer 1:", value),
});

const subscription2 = subject.subscribe({
  next: (value) => console.log("Observer 2:", value),
});

subject.next(1);
subject.next(2);
```

### BehaviorSubject

Subject with current value:

```typescript
import { createBehaviorSubject } from "@wpackages/effect/observable";

const subject = createBehaviorSubject(0);

subject.subscribe({
  next: (value) => console.log("Received:", value),
});

console.log("Current:", subject.getValue()); // 0

subject.next(1);
console.log("Current:", subject.getValue()); // 1
```

### ReplaySubject

Subject that replays past values:

```typescript
import { createReplaySubject } from "@wpackages/effect/observable";

const subject = createReplaySubject(3);

subject.next(1);
subject.next(2);
subject.next(3);

// Late subscriber receives past values
subject.subscribe({
  next: (value) => console.log("Received:", value),
});
// Logs: 1, 2, 3
```

## Combining Observables

### merge

Merge multiple observables:

```typescript
import { fromPromise, merge } from "@wpackages/effect/observable";

const obs1 = fromPromise(Promise.resolve(1));
const obs2 = fromPromise(Promise.resolve(2));
const obs3 = fromPromise(Promise.resolve(3));

const merged = merge(obs1, obs2, obs3);
```

## Use Cases

### Real-time Updates

```typescript
import { createObservable, map, filter, debounceTime } from "@wpackages/effect/observable";

const searchObservable = createObservable((observer) => {
  const input = document.querySelector("input");
  input?.addEventListener("input", (event) => {
    observer.next((event.target as HTMLInputElement).value);
  });
  return () => input?.removeEventListener("input", () => {});
});

const searchResults = pipe(
  searchObservable,
  debounceTime(300),
  map((query) => fetch(`/api/search?q=${query}`).then((r) => r.json())),
  filter((results) => results.length > 0),
);
```

### WebSocket Streams

```typescript
import { createObservable, map, filter } from "@wpackages/effect/observable";

const wsObservable = createObservable((observer) => {
  const ws = new WebSocket("ws://localhost:8080");

  ws.onmessage = (event) => {
    observer.next(JSON.parse(event.data));
  };

  ws.onerror = (error) => {
    observer.error(error);
  };

  ws.onclose = () => {
    observer.complete();
  };

  return () => {
    ws.close();
  };
});

const messages = pipe(
  wsObservable,
  filter((msg) => msg.type === "message"),
  map((msg) => msg.data),
);
```

### Form Validation

```typescript
import { createObservable, map, debounceTime, filter } from "@wpackages/effect/observable";

const formObservable = createObservable((observer) => {
  const form = document.querySelector("form");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    observer.next(Object.fromEntries(formData));
  });
  return () => form?.removeEventListener("submit", () => {});
});

const validatedForm = pipe(
  formObservable,
  debounceTime(300),
  map(validateForm),
  filter((result) => result.isValid),
);
