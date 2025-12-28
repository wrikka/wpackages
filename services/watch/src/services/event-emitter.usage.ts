import { createEventEmitter } from "./event-emitter";

console.log("--- Event Emitter Usage ---");

const emitter = createEventEmitter();

// Register event handlers
const changeHandler = (event: any) => {
	console.log("File changed:", event.path);
};

const addHandler = (event: any) => {
	console.log("File added:", event.path);
};

console.log("\n1. Register handlers:");
emitter.on("change", changeHandler);
emitter.on("add", addHandler);
console.log("Listeners for 'change':", emitter.listenerCount("change")); // 1
console.log("Listeners for 'add':", emitter.listenerCount("add")); // 1

// Emit events
console.log("\n2. Emit events:");
emitter.emit("change", { path: "src/index.ts" });
emitter.emit("add", { path: "src/utils.ts" });

// Once handler
console.log("\n3. Register one-time handler:");
const onceHandler = (event: any) => {
	console.log("First error only:", event.message);
};

emitter.once("error", onceHandler);
emitter.emit("error", { message: "Error 1" });
emitter.emit("error", { message: "Error 2" }); // onceHandler won't be called

// Remove handler
console.log("\n4. Remove specific handler:");
emitter.off("change", changeHandler);
console.log("Listeners for 'change' after removal:", emitter.listenerCount("change")); // 0

// Remove all handlers for event
console.log("\n5. Remove all handlers for event:");
emitter.on("add", addHandler);
emitter.on("add", (_e) => console.log("Another add handler"));
emitter.off("add"); // Remove all
console.log("Listeners for 'add' after removal:", emitter.listenerCount("add")); // 0

// Remove all listeners
console.log("\n6. Remove all listeners:");
emitter.on("change", changeHandler);
emitter.on("add", addHandler);
emitter.removeAllListeners();
console.log("Listeners for 'change':", emitter.listenerCount("change")); // 0
console.log("Listeners for 'add':", emitter.listenerCount("add")); // 0
