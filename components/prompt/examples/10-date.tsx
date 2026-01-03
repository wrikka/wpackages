import React from "react";
import { DatePrompt, prompt } from "../src";

async function main() {
	const date = await prompt(DatePrompt, { message: "Select a date:" }, new Date());
	console.log(`Selected date: ${date.toDateString()}`);
}

main();
