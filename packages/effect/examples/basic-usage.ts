import {
  Effect,
  gen,
  succeed,
  fail,
  sync,
  tryPromise,
  runPromise,
  map,
  flatMap,
  pipe,
  all,
} from "@wpackages/effect";

// Basic success
const successExample = async () => {
  const effect = succeed(42);
  const result = await runPromise(effect);
  console.log("Success:", result);
};

// Basic failure
const failureExample = async () => {
  const effect = fail({ message: "Something went wrong" });
  const result = await runPromise(effect);
  console.log("Failure:", result);
};

// Sync effect
const syncExample = async () => {
  const effect = sync(() => Math.random());
  const result = await runPromise(effect);
  console.log("Sync:", result);
};

// Async effect
const asyncExample = async () => {
  const effect = tryPromise(
    () => fetch("https://api.example.com/data"),
    (error) => ({ message: "Fetch failed", error }),
  );
  const result = await runPromise(effect);
  console.log("Async:", result);
};

// Generator
const generatorExample = async () => {
  const effect = gen(function*() {
    const a = yield* succeed(1);
    const b = yield* succeed(2);
    const c = yield* succeed(3);
    return succeed(a + b + c);
  });
  const result = await runPromise(effect);
  console.log("Generator:", result);
};

// Combinators
const combinatorsExample = async () => {
  const effect = pipe(
    succeed(1),
    map((x) => x * 2),
    flatMap((x) => succeed(x + 10)),
  );
  const result = await runPromise(effect);
  console.log("Combinators:", result);
};

// All
const allExample = async () => {
  const effect = all([succeed(1), succeed(2), succeed(3)]);
  const result = await runPromise(effect);
  console.log("All:", result);
};

// Run all examples
const main = async () => {
  console.log("=== Basic Usage Examples ===\n");

  await successExample();
  await failureExample();
  await syncExample();
  await asyncExample();
  await generatorExample();
  await combinatorsExample();
  await allExample();
};

main();
