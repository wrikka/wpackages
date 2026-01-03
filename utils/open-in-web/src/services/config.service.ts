import { cosmiconfig } from "cosmiconfig";

export interface Config {
	port?: number;
	css?: string;
	theme?: string;
	toc?: boolean;
	mermaid?: boolean;
}

const explorer = cosmiconfig("openinweb");

export async function loadConfig(): Promise<Config | null> {
	try {
		const result = await explorer.search();
		return result ? result.config : null;
	} catch (error) {
		console.error("\n⚠️  Error loading configuration file:");
		console.error(error);
		return null;
	}
}
