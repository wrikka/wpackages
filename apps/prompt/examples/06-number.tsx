import React from "react";
import { NumberPrompt, prompt } from "../src";

async function main() {
	const age = await prompt(NumberPrompt, { message: "How old are you?", min: 18 }, 18);
	console.log(`Your age: ${age}`);
}

main();
