import type { GitConfig } from "../types/git";

export const createGitConfig = (
	options: Partial<GitConfig> = {},
): GitConfig => {
	const configData: { cwd: string; author?: { readonly name: string; readonly email: string } } = {
		cwd: options.cwd ?? process.cwd(),
	};

	if (options.author !== undefined) {
		configData.author = options.author;
	}

	return configData as GitConfig;
};
