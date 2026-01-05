import { confirm, group, select, text } from "../src";

async function main() {
	console.clear();
	const results = await group({
		intro: "Project Setup",
		outro: "Setup complete!",
		prompts: {
			projectName: text({ message: "What is your project name?" }),
			useTypescript: confirm({ message: "Use TypeScript?" }),
			packageManager: select({
				message: "Select a package manager",
				options: [
					{ value: "bun", label: "Bun" },
					{ value: "npm", label: "NPM" },
					{ value: "yarn", label: "Yarn" },
				],
			}),
		},
	});

	if (results) {
		console.log("Project Configuration:", results);
	} else {
		console.log("Project setup cancelled.");
	}
}

void main().catch(console.error);
