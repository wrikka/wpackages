import { Effect } from "effect";

const commandTemplate = (commandName: string) => `
import type { Command } from "../../types";

export const ${commandName}: Command = {
  name: "${commandName}",
  description: "Description for ${commandName}",
  action: () => {
    console.log("Executing ${commandName} command!");
  },
};
`;

export const generateCommand = (name: string): Effect.Effect<void, Error> =>
	Effect.tryPromise({
		try: async () => {
			const commandName = name.trim();
			if (!commandName) {
				throw new Error("Command name cannot be empty.");
			}

			const filePath = `src/commands/${commandName}.ts`;
			const content = commandTemplate(commandName);

			// Ensure directory exists
			await Bun.write(filePath, content);
			console.log(`Successfully created command at ${filePath}`);
		},
		catch: (error: unknown) => new Error(`Failed to generate command: ${String(error)}`),
	});
