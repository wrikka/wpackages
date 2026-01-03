import React from "react";
import { prompt, TogglePrompt } from "../src";

async function main() {
	const enabled = await prompt(TogglePrompt, { message: "Enable feature?" }, false);
	console.log(`Feature enabled: ${enabled}`);
}

main();
