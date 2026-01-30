import { describe, expect, mock, test } from "bun:test";
import { Stream } from "../src/index";
import { Optional } from "../src/utils/optional";

describe("Stream", () => {
	test("Stream.of creates a stream from elements", () => {
		const result = Stream.of(1, 2, 3).collect();
		expect(result).toEqual([1, 2, 3]);
	});

	test("Stream.from creates a stream from an iterable", () => {
		const result = Stream.from([1, 2, 3]).collect();
		expect(result).toEqual([1, 2, 3]);
	});

	test("map transforms elements", () => {
		const result = Stream.of(1, 2, 3).map(x => x * 2).collect();
		expect(result).toEqual([2, 4, 6]);
	});

	test("filter selects elements", () => {
		const result = Stream.of(1, 2, 3, 4).filter(x => x % 2 === 0).collect();
		expect(result).toEqual([2, 4]);
	});

	test("flatMap transforms and flattens", () => {
		const result = Stream.of(1, 2).flatMap(x => [x, x * 2]).collect();
		expect(result).toEqual([1, 2, 2, 4]);
	});

	test("peek performs an action on each element", () => {
		const fn = mock((_: number) => {});
		Stream.of(1, 2, 3).peek(fn).collect();
		expect(fn).toHaveBeenCalledTimes(3);
		expect(fn.mock.calls).toEqual([[1], [2], [3]]);
	});

	test("distinct returns unique elements", () => {
		const result = Stream.of(1, 2, 2, 3, 1, 4).distinct().collect();
		expect(result).toEqual([1, 2, 3, 4]);
	});

	test("sorted sorts elements", () => {
		const result = Stream.of(3, 1, 4, 2).sorted().collect();
		expect(result).toEqual([1, 2, 3, 4]);
	});

	test("sorted with comparator", () => {
		const result = Stream.of(3, 1, 4, 2).sorted((a, b) => b - a).collect();
		expect(result).toEqual([4, 3, 2, 1]);
	});

	test("limit restricts the number of elements", () => {
		const result = Stream.of(1, 2, 3, 4, 5).limit(3).collect();
		expect(result).toEqual([1, 2, 3]);
	});

	test("skip ignores the first n elements", () => {
		const result = Stream.of(1, 2, 3, 4, 5).skip(3).collect();
		expect(result).toEqual([4, 5]);
	});

	test("chaining operations", () => {
		const result = Stream.of(1, 2, 3, 4, 5, 6)
			.filter(x => x % 2 === 0)
			.map(x => x * 10)
			.skip(1)
			.limit(1)
			.collect();
		expect(result).toEqual([40]);
	});

	// Terminal Operations
	test("forEach executes an action for each element", () => {
		const fn = mock((_: number) => {});
		Stream.of(1, 2, 3).forEach(fn);
		expect(fn).toHaveBeenCalledTimes(3);
	});

	test("reduce with identity", () => {
		const result = Stream.of(1, 2, 3).reduce((a, b) => a + b, 0).get();
		expect(result).toBe(6);
	});

	test("reduce without identity", () => {
		const result = Stream.of(1, 2, 3).reduce((a, b) => a + b).get();
		expect(result).toBe(6);
	});

	test("reduce on empty stream returns empty Optional", () => {
		const result = Stream.of<number>().reduce((a, b) => a + b);
		expect(result.isPresent()).toBe(false);
	});

	test("findFirst finds the first element", () => {
		const result = Stream.of(1, 2, 3).findFirst();
		expect(result.isPresent()).toBe(true);
		expect(result.get()).toBe(1);
	});

	test("findFirst on empty stream returns empty Optional", () => {
		const result = Stream.of<number>().findFirst();
		expect(result.isPresent()).toBe(false);
	});

	test("count returns the number of elements", () => {
		const result = Stream.of(1, 2, 3, 4, 5).count();
		expect(result).toBe(5);
	});

	test("anyMatch returns true if any element matches", () => {
		const result = Stream.of(1, 2, 3).anyMatch(x => x > 2);
		expect(result).toBe(true);
	});

	test("allMatch returns true if all elements match", () => {
		const result = Stream.of(2, 4, 6).allMatch(x => x % 2 === 0);
		expect(result).toBe(true);
	});

	test("noneMatch returns true if no elements match", () => {
		const result = Stream.of(1, 3, 5).noneMatch(x => x % 2 === 0);
		expect(result).toBe(true);
	});

	test("join concatenates elements", () => {
		const result = Stream.of(1, 2, 3).join("-");
		expect(result).toBe("1-2-3");
	});

	// Static Generators
	test("Stream.generate creates an infinite stream", () => {
		const result = Stream.generate(() => 1).limit(5).collect();
		expect(result).toEqual([1, 1, 1, 1, 1]);
	});

	test("Stream.iterate creates an infinite sequential stream", () => {
		const result = Stream.iterate(0, x => x + 2).limit(4).collect();
		expect(result).toEqual([0, 2, 4, 6]);
	});

	test("Stream.range creates a range of numbers", () => {
		const result = Stream.range(1, 5).collect();
		expect(result).toEqual([1, 2, 3, 4]);
	});
});

describe("Optional", () => {
	test("Optional.of with value", () => {
		const opt = Optional.of(10);
		expect(opt.isPresent()).toBe(true);
		expect(opt.get()).toBe(10);
	});

	test("Optional.of with null", () => {
		const opt = Optional.of(null);
		expect(opt.isPresent()).toBe(false);
	});

	test("Optional.empty", () => {
		const opt = Optional.empty();
		expect(opt.isPresent()).toBe(false);
	});

	test("get throws error when not present", () => {
		expect(() => Optional.empty().get()).toThrow("Value is not present");
	});

	test("orElse returns value when present", () => {
		const value = Optional.of(10).orElse(20);
		expect(value).toBe(10);
	});

	test("orElse returns other when not present", () => {
		const value = Optional.empty<number>().orElse(20);
		expect(value).toBe(20);
	});

	test("ifPresent executes consumer when present", () => {
		const fn = mock((_: number) => {});
		Optional.of(10).ifPresent(fn);
		expect(fn).toHaveBeenCalledWith(10);
	});

	test("ifPresent does not execute consumer when not present", () => {
		const fn = mock((_: number) => {});
		Optional.empty<number>().ifPresent(fn);
		expect(fn).not.toHaveBeenCalled();
	});
});
