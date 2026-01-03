import React from "react";
import { ConfirmPrompt, prompt } from "../src";

async function main() {
	const confirmed = await prompt(ConfirmPrompt, { message: "Do you want to continue?" }, true);
	console.log(`Confirmed: ${confirmed}`);
}

main();
