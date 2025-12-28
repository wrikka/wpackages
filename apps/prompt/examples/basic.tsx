import pc from "picocolors";
import React from "react";
import { TextPrompt } from "../src/components";
import { prompt } from "../src/context";

async function main() {
	console.clear();
	console.log(pc.blue("Welcome to @wrikka/prompt with Ink.js!"));

	const name = await prompt(
		TextPrompt,
		{ message: "What is your name?", placeholder: "Type here..." },
		"",
	);

	if (typeof name === "symbol") {
		console.log(pc.yellow("Prompt cancelled."));
		return;
	}

	console.log(pc.green(`Hello, ${name}!`));
}

main();
