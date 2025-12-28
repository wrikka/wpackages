import React from "react";
import { prompt, TextPrompt } from "../src";

async function main() {
	const name = await prompt(TextPrompt, { message: "What is your name?" }, "");
	console.log(`Hello, ${name}!`);
}

main();
