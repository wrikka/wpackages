import picocolors from "picocolors";

export const printSuccess = (message: string): void => {
	console.log(picocolors.green("✓"), message);
};

export const printError = (message: string): void => {
	console.error(picocolors.red("✗"), message);
};

export const printWarning = (message: string): void => {
	console.warn(picocolors.yellow("⚠"), message);
};

export const printInfo = (message: string): void => {
	console.log(picocolors.blue("ℹ"), message);
};

export const printCode = (code: string, language: string): void => {
	console.log(picocolors.cyan(`\n// Translated ${language}:`));
	console.log(picocolors.gray("─".repeat(50)));
	console.log(code);
	console.log(picocolors.gray("─".repeat(50)));
};

export const printConfidence = (confidence: number): void => {
	const percentage = Math.round(confidence * 100);
	const color = percentage >= 80 ? picocolors.green : percentage >= 50 ? picocolors.yellow : picocolors.red;
	console.log(color(`Confidence: ${percentage}%`));
};

export const printProgress = (message: string): void => {
	console.log(picocolors.dim("→"), message);
};
