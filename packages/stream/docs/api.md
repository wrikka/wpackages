# API Reference

This document provides a detailed API reference for `@w/stream`.

## Stream

The main class for creating and manipulating streams.

### Static Methods

- `Stream.of<T>(...elements: T[]): Stream<T>`
- `Stream.from<T>(iterable: Iterable<T>): Stream<T>`
- `Stream.generate<T>(supplier: () => T): Stream<T>`
- `Stream.iterate<T>(seed: T, f: (t: T) => T): Stream<T>`
- `Stream.range(startInclusive: number, endExclusive: number): Stream<number>`

### Instance Methods (Intermediate)

- `map<R>(mapper: (value: T) => R): Stream<R>`
- `filter(predicate: (value: T) => boolean): Stream<T>`
- `flatMap<R>(mapper: (value: T) => Iterable<R>): Stream<R>`
- `peek(action: (value: T) => void): Stream<T>`
- `distinct(): Stream<T>`
- `sorted(comparator?: (a: T, b: T) => number): Stream<T>`
- `limit(maxSize: number): Stream<T>`
- `skip(n: number): Stream<T>`

### Instance Methods (Terminal)

- `collect(): T[]`
- `forEach(action: (value: T) => void): void`
- `reduce(reducer: (a: T, b: T) => T, identity?: T): Optional<T>`
- `findFirst(): Optional<T>`
- `count(): number`
- `anyMatch(predicate: (value: T) => boolean): boolean`
- `allMatch(predicate: (value: T) => boolean): boolean`
- `noneMatch(predicate: (value: T) => boolean): boolean`
- `join(separator?: string): string`

## Optional

A container object which may or may not contain a non-null value.

### Instance Methods

- `isPresent(): boolean`
- `get(): T`
- `ifPresent(consumer: (value: T) => void): void`
- `orElse(other: T): T`
- `orElseGet(supplier: () => T): T`
- `orElseThrow(errorSupplier: () => Error): T`
- `map<U>(mapper: (value: T) => U): Optional<U>`
- `filter(predicate: (value: T) => boolean): Optional<T>`
