import { createConfigManager } from "../src";

// 1. Define the shape of your configuration
interface AppConfig {
	port: number;
	nodeEnv: "development" | "production" | "test";
	apiKey: string;
}

// 2. Create a config manager with a validation schema
const configManager = createConfigManager<AppConfig>({
	schema: {
		port: { type: "number", required: true, env: "PORT", default: 3000 },
		nodeEnv: {
			choices: ["development", "production", "test"],
			required: true,
			env: "NODE_ENV",
			default: "development",
		},
		apiKey: { type: "string", required: true, env: "API_KEY" },
	},
});

// 3. Load the configuration
async function start() {
	try {
		// This will load from .env files, environment variables, and defaults, then validate.
		const { config } = await configManager.load();

		console.log("Configuration loaded successfully:", config);
		// Now you can start your application with the validated `config` object.
	} catch (error) {
		console.error("Failed to load configuration:", (error as Error).message);
		process.exit(1);
	}
}

start();
