/**
 * Usage examples for format utilities
 */

import type { PluginHealthCheck, PluginPerformanceStats, PluginState } from "../types";
import {
	formatDate,
	formatHealth,
	formatList,
	formatPluginInfo,
	formatStats,
	formatStatus,
	formatTable,
} from "./format.utils";

// Example 1: Format plugin status
console.log("=== Example 1: Format Status ===");
console.log(formatStatus("enabled"));
console.log(formatStatus("disabled"));
console.log(formatStatus("installed"));
console.log(formatStatus("error"));

// Example 2: Format dates
console.log("\n=== Example 2: Format Date ===");
const now = new Date();
const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
console.log(`Now: ${formatDate(now)}`);
console.log(`Yesterday: ${formatDate(yesterday)}`);

// Example 3: Format plugin info
console.log("\n=== Example 3: Format Plugin Info ===");
const pluginState: PluginState = {
	plugin: {
		metadata: {
			id: "sample-plugin",
			name: "Sample Plugin",
			version: "1.2.3",
			author: "John Doe",
			description: "A sample plugin for demonstration",
			homepage: "https://example.com",
			license: "MIT",
		},
		init: async () => {},
	},
	status: "enabled",
	installedAt: new Date("2024-01-15T10:30:00Z"),
	enabledAt: new Date("2024-01-15T10:35:00Z"),
};

console.log(formatPluginInfo(pluginState));

// Example 4: Format health check results
console.log("\n=== Example 4: Format Health ===");
const healthyPlugin: PluginHealthCheck = {
	pluginId: "auth-plugin",
	healthy: true,
	lastCheck: new Date(),
	message: "All systems operational",
};

const unhealthyPlugin: PluginHealthCheck = {
	pluginId: "db-plugin",
	healthy: false,
	lastCheck: new Date(),
	message: "Database connection timeout",
};

console.log(formatHealth(healthyPlugin));
console.log(formatHealth(unhealthyPlugin));

// Example 5: Format performance statistics
console.log("\n=== Example 5: Format Statistics ===");
const stats: PluginPerformanceStats = {
	totalPlugins: 15,
	enabledPlugins: 12,
	errorPlugins: 1,
	averageLoadTime: 234.567,
	averageInitTime: 123.456,
};

console.log(formatStats(stats));

// Example 6: Format list of items
console.log("\n=== Example 6: Format List ===");
const pluginNames = [
	"Authentication Plugin",
	"Database Plugin",
	"Cache Plugin",
	"Logger Plugin",
	"Metrics Plugin",
];

console.log("Available Plugins:");
console.log(formatList(pluginNames));

// Example 7: Format table
console.log("\n=== Example 7: Format Table ===");
const headers = ["ID", "Name", "Status", "Version"];
const rows = [
	["auth", "Authentication", "Enabled", "2.0.0"],
	["db", "Database", "Enabled", "1.5.3"],
	["cache", "Cache", "Disabled", "1.0.0"],
	["logger", "Logger", "Enabled", "3.2.1"],
];

console.log("Plugin Status Table:");
console.log(formatTable(headers, rows));

// Example 8: Format plugin info without optional fields
console.log("\n=== Example 8: Minimal Plugin Info ===");
const minimalState: PluginState = {
	plugin: {
		metadata: {
			id: "minimal-plugin",
			name: "Minimal Plugin",
			version: "1.0.0",
			description: "A minimal plugin for demonstration",
			author: "Jane Doe",
		},
		init: async () => {},
	},
	status: "installed",
	installedAt: new Date(),
};

console.log(formatPluginInfo(minimalState));

// Example 9: Real-world dashboard example
console.log("\n=== Example 9: Plugin Dashboard ===");
const dashboardStats: PluginPerformanceStats = {
	totalPlugins: 8,
	enabledPlugins: 6,
	errorPlugins: 0,
	averageLoadTime: 156.23,
	averageInitTime: 89.45,
};

console.log(formatStats(dashboardStats));
console.log("");

const dashboardHeaders = ["Plugin", "Status", "Load Time"];
const dashboardRows = [
	["core", "🟢 Enabled", "142ms"],
	["auth", "🟢 Enabled", "178ms"],
	["api", "🟢 Enabled", "165ms"],
	["ui", "🔴 Disabled", "-"],
];

console.log(formatTable(dashboardHeaders, dashboardRows));

// Example 10: Health check report
console.log("\n=== Example 10: Health Check Report ===");
const healthChecks: PluginHealthCheck[] = [
	{
		pluginId: "core-plugin",
		healthy: true,
		lastCheck: new Date(),
		message: "Operating normally",
	},
	{
		pluginId: "auth-plugin",
		healthy: true,
		lastCheck: new Date(),
		message: "All authentication services running",
	},
	{
		pluginId: "db-plugin",
		healthy: false,
		lastCheck: new Date(),
		message: "Slow query detected",
	},
	{
		pluginId: "cache-plugin",
		healthy: true,
		lastCheck: new Date(),
		message: "Cache hit rate: 95%",
	},
];

console.log("Health Check Report:");
for (const check of healthChecks) {
	console.log(formatHealth(check));
}

console.log("\n✓ All examples completed");
