import {
  createMock,
  createStub,
  createSpy,
  assertCalled,
  assertCalledWith,
  assertCalledTimes,
  succeed,
  fail,
  runPromise,
} from "@wpackages/effect";

// Mock example
const mockExample = async () => {
  const mockEffect = createMock<number, Error>();

  mockEffect.mockImplementation((...args) => {
    return args[0] * 2;
  });

  const result = await runPromise(mockEffect());
  console.log("Mock:", result);
  console.log("Calls:", mockEffect.calls);
};

// Stub example
const stubExample = async () => {
  const stubEffect = createStub<number, Error>(42);

  stubEffect.withReturnValue(100);

  const result = await runPromise(stubEffect());
  console.log("Stub:", result);
};

// Stub error example
const stubErrorExample = async () => {
  const stubEffect = createStub<number, Error>();

  stubEffect.withError({ message: "Error" });

  const result = await runPromise(stubEffect());
  console.log("Stub Error:", result);
};

// Spy example
const spyExample = async () => {
  const effect = succeed(42);
  const spy = createSpy(effect);

  await runPromise(spy);

  console.log("Spy:", spy.getCalls());
  console.log("Was called:", spy.wasCalled());
  console.log("Was called with (1, 2, 3):", spy.wasCalledWith(1, 2, 3));
};

// Assertions
const assertionsExample = async () => {
  const effect = succeed(42);
  const spy = createSpy(effect);

  await runPromise(spy);

  assertCalled(spy);
  assertCalledWith(spy, 1, 2, 3);
  assertCalledTimes(spy, 1);

  console.log("All assertions passed!");
};

// Testing success
const successTestExample = async () => {
  const effect = succeed(42);
  const result = await runPromise(effect);

  if (result._tag === "Success") {
    console.log("Success test passed:", result.value);
  }
};

// Testing failure
const failureTestExample = async () => {
  const effect = fail({ message: "Error" });
  const result = await runPromise(effect);

  if (result._tag === "Failure") {
    console.log("Failure test passed:", result.error);
  }
};

// Run all examples
const main = async () => {
  console.log("=== Testing Examples ===\n");

  await mockExample();
  await stubExample();
  await stubErrorExample();
  await spyExample();
  await assertionsExample();
  await successTestExample();
  await failureTestExample();
};

main();
