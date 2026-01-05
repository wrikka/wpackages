import { filesystem, prompt } from "../src";

async function main() {
	const selectedPath = await prompt(
		filesystem({
			message: "Select a file or directory",
		}),
	);

	if (selectedPath && typeof selectedPath === "string") {
		console.log(`You selected: ${selectedPath}`);
	} else {
		console.log("You didn't select anything.");
	}
}

void main().catch(console.error);
