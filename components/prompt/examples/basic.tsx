import pc from "picocolors";
import { prompt } from "../src/context";
import { isCancel, text } from "../src/index";

async function main() {
	console.clear();
	console.log(pc.blue("Welcome to @wrikka/prompt with Ink.js!"));

	const name = await prompt(
		text({ message: "What is your name?", placeholder: "Type here..." }),
	);

	if (isCancel(name)) {
		console.log(pc.yellow("Prompt cancelled."));
		return;
	}

	console.log(pc.green(`Hello, ${String(name.value)}!`));
}

main().catch(console.error);
