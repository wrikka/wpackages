import { signal, effect, computed, batch } from "../src/index";

// Basic signal example
const count = signal(0);

console.log("=== Basic Signal Example ===");
console.log("Initial value:", count.get());

count.set(5);
console.log("After set(5):", count.get());

count.set((v) => v + 1);
console.log("After functional update:", count.get());

// Effect example
console.log("\n=== Effect Example ===");
const name = signal("World");

const stopGreeting = effect(() => {
	console.log(`Hello, ${name.get()}!`);
});

name.set("Universe");
name.set("React");

stopGreeting();
console.log("(Effect stopped)");

// Computed example
console.log("\n=== Computed Example ===");
const firstName = signal("John");
const lastName = signal("Doe");

const fullName = computed(() => `${firstName.get()} ${lastName.get()}`);

console.log("Full name:", fullName.get());

firstName.set("Jane");
console.log("After first name change:", fullName.get());

// Batch example
console.log("\n=== Batch Example ===");
const a = signal(1);
const b = signal(2);

let effectRuns = 0;
const stopSumEffect = effect(() => {
	effectRuns++;
	console.log(`Effect run #${effectRuns}: a=${a.get()}, b=${b.get()}`);
});

console.log("Before batch:");
effectRuns = 0;

batch(() => {
	a.set(10);
	b.set(20);
	console.log("Inside batch - effect should not run yet");
});

console.log("After batch - effect ran once");
console.log(`Effect ran ${effectRuns} time(s) (expected: 1)`);

stopSumEffect();

console.log("\n=== Examples Complete ===");
