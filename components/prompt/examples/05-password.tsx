import React from "react";
import { PasswordPrompt, prompt } from "../src";

async function main() {
	await prompt(PasswordPrompt, { message: "Enter your password:" }, "");
	console.log("Password received.");
}

main();
