import picocolors from "picocolors";
import { confirm, note, prompt, text } from "../src";

async function main() {
	const customTheme = {
		colors: {
			primary: picocolors.magenta,
			message: picocolors.yellow,
		},
		symbols: {
			radioOn: ">>",
			radioOff: "  ",
		},
	};

	await prompt(note({ title: "Default Theme", message: "This is how prompts look by default." }));
	await prompt(text({ message: "What is your name?" }));
	await prompt(confirm({ message: "Do you agree?" }));

	await prompt(note({ title: "Custom Theme", message: "This is how prompts look with a custom theme.", type: "info" }));
	await prompt(text({ message: "What is your name?" }), { theme: customTheme });
	await prompt(confirm({ message: "Do you agree?" }), { theme: customTheme });
}

void main();
