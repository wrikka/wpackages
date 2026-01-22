import { Effect } from "effect";
import { generateCommand } from "./src/services/scaffold.service";

export default {
	commands: [
		{
			name: "generate:command",
			aliases: ["g:c"],
			description: "Generate a new command file.",
			options: [
				{
					name: "--name",
					shorthand: "-n",
					description: "The name of the command to generate.",
					required: true,
				},
			],
			action: (args: { name: string }) => {
				Effect.runPromise(generateCommand(args.name)).catch(console.error);
			},
		},
		{
			name: "config-test",
			description: "A command from the config file",
			action: () => {
				console.log("This command was loaded from my-cli.config.ts!");
			},
		},
	],
};
