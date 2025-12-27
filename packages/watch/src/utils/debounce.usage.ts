import { createDebouncer, createThrottler } from "./debounce";

// Usage of createDebouncer
console.log("--- Debouncer Example ---");

const expensiveFunction = (value: string) => {
	console.log(`Expensive function called with: ${value}`);
};

const debouncedFunction = createDebouncer(expensiveFunction, 1000);

debouncedFunction("call 1");
debouncedFunction("call 2");
debouncedFunction("call 3");

console.log(
	"Debounced function was called multiple times, but the expensive function will only be executed once after 1 second.",
);

// To see the output, you would need to run this in an environment that waits for the timeout.
// For example, using Node.js:
// setTimeout(() => console.log("Finished debouncer example"), 1500);

// Usage of createThrottler
console.log("\n--- Throttler Example ---");

const frequentEventFunction = (...args: readonly unknown[]): void => {
	const event = args[0] as string;
	console.log(`Handler called for event: ${event}`);
};

const throttledHandler = createThrottler(frequentEventFunction, 1000);

console.log("Calling throttled handler repeatedly...");
throttledHandler("event 1"); // Will be called immediately
throttledHandler("event 2"); // Will be ignored
throttledHandler("event 3"); // Will be ignored

setTimeout(() => {
	console.log("\nCalling throttled handler after 1.2 seconds...");
	throttledHandler("event 4"); // Will be called
}, 1200);

// setTimeout(() => console.log("Finished throttler example"), 2500);
