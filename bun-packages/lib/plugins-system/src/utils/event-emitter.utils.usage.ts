/**
 * Usage examples for event emitter utilities
 */

import type { PluginEvent } from "../types";
import { createEventEmitter } from "./event-emitter.utils";

// Example 1: Basic event emitter usage
console.log("=== Example 1: Basic Event Emitter ===");
const emitter = createEventEmitter();

// Register event handler
emitter.on("plugin:installed", (event) => {
	console.log(`Plugin installed: ${event.pluginId}`);
});

// Emit event
await emitter.emit({
	type: "plugin:installed",
	pluginId: "my-plugin",
	timestamp: new Date(),
});

// Example 2: Multiple handlers for same event
console.log("\n=== Example 2: Multiple Handlers ===");
const emitter2 = createEventEmitter();

emitter2.on("plugin:enabled", (event) => {
	console.log(`[Logger] Plugin enabled: ${event.pluginId}`);
});

emitter2.on("plugin:enabled", (event) => {
	console.log(`[Metrics] Recording enable event for: ${event.pluginId}`);
});

await emitter2.emit({
	type: "plugin:enabled",
	pluginId: "test-plugin",
	timestamp: new Date(),
});

// Example 3: Using once for one-time handlers
console.log("\n=== Example 3: Once Handler ===");
const emitter3 = createEventEmitter();

emitter3.once("plugin:installed", (event) => {
	console.log(`First install detected: ${event.pluginId}`);
});

await emitter3.emit({
	type: "plugin:installed",
	pluginId: "plugin-1",
	timestamp: new Date(),
});

// This won't trigger the handler
await emitter3.emit({
	type: "plugin:installed",
	pluginId: "plugin-2",
	timestamp: new Date(),
});

// Example 4: Events with data payload
console.log("\n=== Example 4: Events with Data ===");
const emitter4 = createEventEmitter();

emitter4.on<{ error: Error }>("plugin:error", (event) => {
	console.log(`Error in plugin ${event.pluginId}:`, event.data?.error.message);
});

await emitter4.emit({
	type: "plugin:error",
	pluginId: "problematic-plugin",
	timestamp: new Date(),
	data: { error: new Error("Something went wrong") },
});

// Example 5: Removing event handlers
console.log("\n=== Example 5: Removing Handlers ===");
const emitter5 = createEventEmitter();

const handler = (event: PluginEvent) => {
	console.log(`Handler called for: ${event.pluginId}`);
};

emitter5.on("plugin:disabled", handler);

// Emit once
await emitter5.emit({
	type: "plugin:disabled",
	pluginId: "plugin-1",
	timestamp: new Date(),
});

// Remove handler
emitter5.off("plugin:disabled", handler);

// This won't trigger anything
await emitter5.emit({
	type: "plugin:disabled",
	pluginId: "plugin-2",
	timestamp: new Date(),
});

// Example 6: Plugin lifecycle event system
console.log("\n=== Example 6: Plugin Lifecycle Events ===");
const lifecycleEmitter = createEventEmitter();

// Setup lifecycle handlers
lifecycleEmitter.on("plugin:installed", (event) => {
	console.log(`✓ Installed: ${event.pluginId}`);
});

lifecycleEmitter.on("plugin:enabled", (event) => {
	console.log(`✓ Enabled: ${event.pluginId}`);
});

lifecycleEmitter.on("plugin:disabled", (event) => {
	console.log(`✓ Disabled: ${event.pluginId}`);
});

lifecycleEmitter.on("plugin:uninstalled", (event) => {
	console.log(`✓ Uninstalled: ${event.pluginId}`);
});

// Simulate plugin lifecycle
const pluginId = "example-plugin";

await lifecycleEmitter.emit({
	type: "plugin:installed",
	pluginId,
	timestamp: new Date(),
});

await lifecycleEmitter.emit({
	type: "plugin:enabled",
	pluginId,
	timestamp: new Date(),
});

await lifecycleEmitter.emit({
	type: "plugin:disabled",
	pluginId,
	timestamp: new Date(),
});

await lifecycleEmitter.emit({
	type: "plugin:uninstalled",
	pluginId,
	timestamp: new Date(),
});

console.log("\n✓ All examples completed");
