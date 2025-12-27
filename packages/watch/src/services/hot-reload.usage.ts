import type { WatchEvent } from "../types";
import { HotReloadService } from "./hot-reload";

console.log("--- Hot Reload Service Usage ---");

const hotReloadService = new HotReloadService(200); // 200ms debounce

// Register reload callbacks
console.log("\n1. Register reload callbacks:");

hotReloadService.onReload((event: WatchEvent) => {
	console.log(`  Reloading due to: ${event.type} - ${event.path}`);
});

hotReloadService.onReload((event: WatchEvent) => {
	console.log(`  Notifying clients about change in: ${event.path}`);
});

// Simulate file changes
console.log("\n2. Simulate file changes:");

const mockEvent1: WatchEvent = {
	type: "change",
	path: "/src/index.ts",
	timestamp: Date.now(),
};

const mockEvent2: WatchEvent = {
	type: "change",
	path: "/src/utils.ts",
	timestamp: Date.now(),
};

console.log("  Triggering reload for file 1...");
hotReloadService.triggerReload(mockEvent1);

console.log("  Triggering reload for file 2 (within debounce window)...");
hotReloadService.triggerReload(mockEvent2);

console.log("  (Callbacks will execute after 200ms debounce)");

// Check reload status
console.log("\n3. Check reload status:");
console.log(`  Is reloading now: ${hotReloadService.isReloadingNow()}`);

// Clear callbacks
console.log("\n4. Clear all callbacks:");
hotReloadService.clearCallbacks();
console.log("  All callbacks cleared");

// Register new callback
console.log("\n5. Register new callback:");
hotReloadService.onReload((event: WatchEvent) => {
	console.log(`  New callback: ${event.path}`);
});

console.log("  New callback registered");
