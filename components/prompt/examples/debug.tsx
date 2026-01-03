import { prompt, text } from "../src";

async function main() {
	console.log("Starting debug script...");
	try {
		const name = await prompt(text({ message: "What is your name?" }));
		console.log(`Hello, ${String(name)}!`);
	} catch (error) {
		console.error("An error occurred:", error);
	}
	console.log("Debug script finished.");
}

void main();
