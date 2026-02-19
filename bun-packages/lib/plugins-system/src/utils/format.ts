import type { PluginHealthCheck, PluginPerformanceStats, PluginState } from "../types";

export const formatPluginInfo = (state: PluginState): string => {
	const { plugin, status, installedAt, enabledAt } = state;
	const { metadata } = plugin;

	const lines = [
		`📦 ${metadata.name} (${metadata.id})`,
		`   Version: ${metadata.version}`,
		`   Status: ${formatStatus(status)}`,
		`   Author: ${metadata.author}`,
		`   Installed: ${formatDate(installedAt)}`,
	];

	if (enabledAt) {
		lines.push(`   Enabled: ${formatDate(enabledAt)}`);
	}

	if (metadata.description) {
		lines.push(`   ${metadata.description}`);
	}

	return lines.join("\n");
};

export const formatStatus = (status: PluginState["status"]): string => {
	const statusMap = {
		disabled: "🔴 Disabled",
		enabled: "🟢 Enabled",
		error: "❌ Error",
		installed: "⚪ Installed",
	};
	return statusMap[status];
};

export const formatDate = (date: Date): string => {
	return date.toLocaleString();
};

export const formatHealth = (health: PluginHealthCheck): string => {
	const icon = health.healthy ? "✅" : "⚠️";
	return `${icon} ${health.pluginId}: ${health.message || "Unknown"}`;
};

export const formatStats = (stats: PluginPerformanceStats): string => {
	return [
		"📊 Plugin Statistics",
		`   Total Plugins: ${stats.totalPlugins}`,
		`   Enabled: ${stats.enabledPlugins}`,
		`   Errors: ${stats.errorPlugins}`,
		`   Avg Load Time: ${stats.averageLoadTime.toFixed(2)}ms`,
		`   Avg Init Time: ${stats.averageInitTime.toFixed(2)}ms`,
	].join("\n");
};

export const formatList = (items: readonly string[]): string => {
	return items.map((item, i) => `  ${i + 1}. ${item}`).join("\n");
};

export const formatTable = (
	headers: readonly string[],
	rows: readonly (readonly string[])[],
): string => {
	if (headers.length === 0) {
		return "";
	}

	if (rows.length === 0) {
		return "";
	}

	const colWidths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i]?.length ?? 0)));

	const formatRow = (cells: readonly string[]) => cells.map((cell, i) => cell.padEnd(colWidths[i] ?? 0)).join(" | ");

	const separator = colWidths.map((w) => "-".repeat(w)).join("-+-");

	return [formatRow(headers), separator, ...rows.map(formatRow)].join("\n");
};
