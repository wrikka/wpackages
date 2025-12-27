/**
 * Pure functions for version formatting and display
 */

import pc from "picocolors";

/**
 * Format version display with colors
 */
export function formatVersionDisplay(
	packageName: string,
	currentVersion: string,
	newVersion: string,
): string {
	return pc.cyan(
		`📦 Releasing ${pc.bold(packageName)} ${pc.bold(currentVersion)} → ${pc.bold(newVersion)}`,
	);
}

/**
 * Format success message
 */
export function formatSuccessMessage(newVersion: string, duration: number): string {
	return pc.green(
		`✨ Successfully released ${pc.bold(newVersion)} in ${duration}ms`,
	);
}

/**
 * Format dry run message
 */
export function formatDryRunMessage(): string {
	return pc.yellow("🔍 Dry run mode - no changes will be made");
}

/**
 * Format step completion message
 */
export function formatStepComplete(step: string): string {
	return pc.green(`✓ ${step}`);
}

/**
 * Format error message
 */
export function formatErrorMessage(message: string): string {
	return pc.red(`❌ Release failed: ${message}`);
}

/**
 * Format warning message
 */
export function formatWarningMessage(message: string): string {
	return pc.yellow(`⚠ ${message}`);
}
