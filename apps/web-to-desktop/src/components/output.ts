/**
 * Pure output functions
 */

import { COLORS } from "../constant/colors.const";

/**
 * Print error message
 */
export function printError(message: string): void {
	console.error();
	console.error(COLORS.red("  ✗ Error:"), message);
	console.error();
}

/**
 * Print success message
 */
export function printSuccess(message: string): void {
	console.log(COLORS.green(message));
}

/**
 * Print green message
 */
export function printGreen(message: string): void {
	console.log(COLORS.green(message));
}

/**
 * Print red message
 */
export function printRed(message: string): void {
	console.log(COLORS.red(message));
}

/**
 * Print info message
 */
export function printInfo(message: string): void {
	console.log(COLORS.cyan(message));
}

/**
 * Print warning message
 */
export function printWarning(message: string): void {
	console.log(COLORS.yellow(message));
}

/**
 * Print dim message
 */
export function printDim(message: string): void {
	console.log(COLORS.dim(message));
}

/**
 * Print bright message
 */
export function printBright(message: string): void {
	console.log(COLORS.bright(message));
}

/**
 * Print blank line
 */
export function printBlank(): void {
	console.log();
}

/**
 * Print header
 */
export function printHeader(title: string, subtitle?: string): void {
	printBlank();
	printBright(title);
	if (subtitle) {
		printDim(subtitle);
	}
	printBlank();
}

/**
 * Print section
 */
export function printSection(title: string): void {
	printBlank();
	printInfo(title);
}

/**
 * Print status line
 */
export function printStatus(label: string, status: boolean): void {
	const icon = status ? COLORS.green("✓") : COLORS.red("✗");
	console.log(`  ${label}: ${icon}`);
}

/**
 * Print next steps
 */
export function printNextSteps(steps: string[]): void {
	printBlank();
	printBright("🎉 Done!");
	printBlank();
	printInfo("  Next steps:");
	printBlank();
	for (const step of steps) {
		console.log(step);
	}
	printBlank();
}

/**
 * Print cyan message (alias for printInfo)
 */
export function printCyan(message: string): void {
	console.log(COLORS.cyan(message));
}
