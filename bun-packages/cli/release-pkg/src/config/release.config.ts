import { DEFAULT_COMMIT_MESSAGE, DEFAULT_TAG_PREFIX } from "../constant/index";
import type { ReleaseOptions } from "../types/index";

export const defaultReleaseOptions: ReleaseOptions = {
	ci: false,
	dryRun: false,
	message: DEFAULT_COMMIT_MESSAGE,
	noChangelog: false,
	noGit: false,
	noPublish: false,
	silent: false,
	tag: DEFAULT_TAG_PREFIX,
	verbose: false,
};

export const createReleaseConfig = (
	options: Partial<ReleaseOptions> = {},
): ReleaseOptions => ({
	...defaultReleaseOptions,
	...options,
});
