import { reactive, readonly, watch, watchEffect, ref } from "../src/index";

// Reactive object example
console.log("=== Reactive Object Example ===");
const state = reactive({ count: 0, name: "test" });

console.log("Initial:", state.count, state.name);

state.count = 5;
console.log("After count = 5:", state.count);

state.name = "updated";
console.log("After name change:", state.name);

// Readonly example
console.log("\n=== Readonly Example ===");
const original = reactive({ value: 10 });
const readonlyOriginal = readonly(original);

console.log("Readonly value:", readonlyOriginal.value);

// This would throw an error:
// readonlyOriginal.value = 20;

// Watch example
console.log("\n=== Watch Example ===");
const watchedCount = ref(0);

const stopWatch = watch(
	() => watchedCount.value,
	(newVal, oldVal) => {
		console.log(`Count changed: ${oldVal} -> ${newVal}`);
	}
);

watchedCount.value = 1;
watchedCount.value = 2;
watchedCount.value = 3;

stopWatch();
console.log("(Watch stopped)");

// WatchEffect example
console.log("\n=== WatchEffect Example ===");
const message = ref("Hello");

const stopWatchEffect = watchEffect(() => {
	console.log("Message:", message.value);
});

message.value = "World";
message.value = "!";

stopWatchEffect();
console.log("(WatchEffect stopped)");

console.log("\n=== Advanced Examples Complete ===");
