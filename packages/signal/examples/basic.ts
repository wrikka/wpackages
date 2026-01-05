import { createEffect, createMemo, createSignal } from "../src";

// 1. Create a signal for a counter
const [count, setCount] = createSignal(0);

// 2. Create a memo that doubles the count
const doubled = createMemo(() => count() * 2);

// 3. Create an effect that logs the values whenever the count changes
createEffect(() => {
	console.log(`Count: ${count()}, Doubled: ${doubled()}`);
});

// 4. Update the count and see the effect run
console.log("Setting count to 5...");
setCount(5);

// 5. Update it again
console.log("Setting count to 10...");
setCount(10);
