import { lazy } from "./lazy-evaluation";

const lazyValue = lazy(() => {
	console.log("Computing value...");
	return 42;
});

console.log("Lazy value created");
console.log("Is evaluated:", lazyValue.isEvaluated());

console.log("Getting value:");
const value = lazyValue.get();
console.log("Value:", value);

console.log("Getting value again:");
const value2 = lazyValue.get();
console.log("Value:", value2);
console.log("Is evaluated:", lazyValue.isEvaluated());
