import { createStorage } from "unstorage";
import type { WServerOptions } from "../types";

export function createWStorage(options: WServerOptions) {
	const storage = createStorage();

	if (options.data?.storage) {
		for (const [name, driverOptions] of Object.entries(options.data.storage)) {
			// In a real implementation, you would dynamically import drivers
			// e.g., if (driverOptions.driver === 'redis') { ... }
			console.log(
				`[wserver] Storage mount '${name}' with driver '${driverOptions.driver}'`,
			);
		}
	}

	return storage;
}
