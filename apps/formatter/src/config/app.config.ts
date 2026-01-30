import { CLI_NAME, CLI_VERSION, CLI_DESCRIPTION } from "../constant";

export const AppConfig = Object.freeze({
	name: CLI_NAME,
	version: CLI_VERSION,
	description: CLI_DESCRIPTION,
}) as const;
