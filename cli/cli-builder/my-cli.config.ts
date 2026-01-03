export default {
	commands: [
		{
			name: "config-test",
			description: "A command from the config file",
			action: () => {
				console.log("This command was loaded from my-cli.config.ts!");
			},
		},
	],
};
