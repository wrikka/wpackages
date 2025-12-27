import { serve } from "bun";
import open from "open";
import { SERVER_MESSAGES } from "../../constant";
import { getFileName } from "../../components";
import { createServerConfig } from "../utils/html-generators";
import type * as types from "../utils/types/open-html";
import { validateHtmlFile } from "../utils/validators";

export async function openHtml(filePath: string, options: types.OpenHtmlOptions) {
	const validatedPath = validateHtmlFile(filePath);
	const serverConfig = createServerConfig(validatedPath);

	try {
		const server = serve(serverConfig);

		console.log(SERVER_MESSAGES.htmlRunning(serverConfig.hostname, serverConfig.port));
		console.log(SERVER_MESSAGES.fileInfo(getFileName(validatedPath)));

		if (options.autoOpen) {
			await open(`http://${serverConfig.hostname}:${serverConfig.port}`);
		}

		return server;
	} catch (err) {
		console.error(`Error opening file: ${err instanceof Error ? err.message : "Unknown error"}`);
		process.exit(1);
	}
}
