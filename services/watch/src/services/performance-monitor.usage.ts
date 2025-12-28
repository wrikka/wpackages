import type { WatchEvent } from "../types";
import { PerformanceMonitor } from "./performance-monitor";

console.log("--- Performance Monitor Usage ---");

const monitor = new PerformanceMonitor();

// Create mock events
const mockEvents: WatchEvent[] = [
	{ type: "add", path: "/src/file1.ts", timestamp: Date.now() },
	{ type: "change", path: "/src/file2.ts", timestamp: Date.now() },
	{ type: "change", path: "/src/file3.ts", timestamp: Date.now() },
	{ type: "unlink", path: "/src/file4.ts", timestamp: Date.now() },
];

// Record events with processing times
console.log("\n1. Recording events:");
mockEvents.forEach((event) => {
	const processingTime = Math.random() * 50; // Simulate 0-50ms processing time
	monitor.recordEvent(event, processingTime);
	console.log(`  Recorded ${event.type} event (${processingTime.toFixed(2)}ms)`);
});

// Get statistics
console.log("\n2. Performance Statistics:");
const stats = monitor.getStats();
console.log(`  Total Events: ${stats.eventCount}`);
console.log(`  Uptime: ${stats.uptime}ms`);
console.log(`  Events per Second: ${stats.eventsPerSecond.toFixed(2)}`);
console.log(`  Avg Processing Time: ${stats.avgProcessingTime.toFixed(2)}ms`);
console.log(`  Min Processing Time: ${stats.minProcessingTime.toFixed(2)}ms`);
console.log(`  Max Processing Time: ${stats.maxProcessingTime.toFixed(2)}ms`);
console.log(`  Total Processing Time: ${stats.totalProcessingTime.toFixed(2)}ms`);

// Event type distribution
console.log("\n3. Event Type Distribution:");
const distribution = monitor.getEventTypeDistribution();
Object.entries(distribution).forEach(([type, percentage]) => {
	console.log(`  ${type}: ${percentage.toFixed(2)}%`);
});

// Get recommendations
console.log("\n4. Performance Recommendations:");
const recommendations = monitor.getRecommendations();
if (recommendations.length === 0) {
	console.log("  ✓ No performance issues detected");
} else {
	recommendations.forEach((rec) => {
		console.log(`  ⚠ ${rec}`);
	});
}

// Reset monitor
console.log("\n5. Reset monitor:");
monitor.reset();
const resetStats = monitor.getStats();
console.log(`  Events after reset: ${resetStats.eventCount}`);
