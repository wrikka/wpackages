import open from "open";
import type { OpenUrlOptions } from "../utils/types/open-url";
import { isValidUrl } from "../utils/url";

export async function openUrl(url: string, options: OpenUrlOptions) {
	if (!isValidUrl(url)) {
		throw new Error("Please provide a valid URL");
	}

	console.log(`\n🚀 Opening URL: ${url}`);

	if (options.autoOpen) {
		await open(url);
	}

	// No server to return, but we can return a promise that resolves when open is done
	return Promise.resolve();
}
