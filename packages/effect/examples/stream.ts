import {
  fromArray,
  fromAsyncIterable,
  map,
  filter,
  flatMap,
  reduce,
  batch,
  toArray,
  pipe,
  runPromise,
} from "@wpackages/effect/stream";

// From array
const fromArrayExample = async () => {
  const stream = fromArray([1, 2, 3, 4, 5]);
  const result = await runPromise(toArray(stream));
  console.log("From Array:", result.value);
};

// From async iterable
const fromAsyncIterableExample = async () => {
  async function* generateNumbers() {
    for (let i = 0; i < 5; i++) {
      yield i;
    }
  }

  const stream = fromAsyncIterable(generateNumbers());
  const result = await runPromise(toArray(stream));
  console.log("From Async Iterable:", result.value);
};

// Map
const mapExample = async () => {
  const stream = fromArray([1, 2, 3]);
  const result = await runPromise(toArray(map((x) => x * 2)(stream)));
  console.log("Map:", result.value);
};

// Filter
const filterExample = async () => {
  const stream = fromArray([1, 2, 3, 4, 5]);
  const result = await runPromise(toArray(filter((x) => x % 2 === 0)(stream)));
  console.log("Filter:", result.value);
};

// FlatMap
const flatMapExample = async () => {
  const stream = fromArray([1, 2, 3]);
  const result = await runPromise(
    toArray(flatMap((x) => fromArray([x, x * 2]))(stream)),
  );
  console.log("FlatMap:", result.value);
};

// Reduce
const reduceExample = async () => {
  const stream = fromArray([1, 2, 3, 4, 5]);
  const result = await runPromise(reduce((acc, x) => acc + x, 0)(stream));
  console.log("Reduce:", result.value);
};

// Batch
const batchExample = async () => {
  const stream = fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const result = await runPromise(toArray(batch(3)(stream)));
  console.log("Batch:", result.value);
};

// Chained operations
const chainedExample = async () => {
  const result = await runPromise(
    pipe(
      fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      map((x) => x * 2),
      filter((x) => x > 10),
      flatMap((x) => fromArray([x, x + 1])),
      reduce((acc, x) => acc + x, 0),
    ),
  );
  console.log("Chained:", result.value);
};

// Run all examples
const main = async () => {
  console.log("=== Stream Examples ===\n");

  await fromArrayExample();
  await fromAsyncIterableExample();
  await mapExample();
  await filterExample();
  await flatMapExample();
  await reduceExample();
  await batchExample();
  await chainedExample();
};

main();
