import { memoize } from "./memoization";

const expensiveFunction = (n: number): number => {
	console.log("Computing...");
	return n * n;
};

const memoizedFunction = memoize(expensiveFunction);

console.log("First call:");
memoizedFunction(5);

console.log("Second call:");
memoizedFunction(5);

console.log("Third call:");
memoizedFunction(5);
