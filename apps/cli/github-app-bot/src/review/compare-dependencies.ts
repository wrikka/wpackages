import { githubRequestJson } from "../github/client";

type Dependencies = Record<string, string>;

const getFileContent = async (args: {
	token: string;
	owner: string;
	repo: string;
	path: string;
	ref: string;
}): Promise<string | null> => {
	try {
		const response = await githubRequestJson<{ content?: string }>({
			token: args.token,
			path: `/repos/${args.owner}/${args.repo}/contents/${args.path}?ref=${args.ref}`,
		});
		if (!response.content) return null;
		return Buffer.from(response.content, "base64").toString("utf8");
	} catch (error) {
		// File might not exist in this ref, which is fine
		return null;
	}
};

const parseDependencies = (content: string | null): Dependencies => {
	if (!content) return {};
	try {
		const json = JSON.parse(content);
		return {
			...json.dependencies,
			...json.devDependencies,
			...json.peerDependencies,
		};
	} catch {
		return {};
	}
};

export const comparePackageJson = async (args: {
	token: string;
	owner: string;
	repo: string;
	path: string;
	baseSha: string;
	headSha: string;
}) => {
	const [baseContent, headContent] = await Promise.all([
		getFileContent({ ...args, ref: args.baseSha, path: args.path }),
		getFileContent({ ...args, ref: args.headSha, path: args.path }),
	]);

	const baseDeps = parseDependencies(baseContent);
	const headDeps = parseDependencies(headContent);

	const allKeys = [...new Set([...Object.keys(baseDeps), ...Object.keys(headDeps)])];

	const added: Dependencies = {};
	const removed: Dependencies = {};
	const changed: Record<string, { from: string; to: string }> = {};

	for (const key of allKeys) {
		const baseVersion = baseDeps[key];
		const headVersion = headDeps[key];

		if (!baseVersion && headVersion) {
			added[key] = headVersion;
		} else if (baseVersion && !headVersion) {
			removed[key] = baseVersion;
		} else if (baseVersion && headVersion && baseVersion !== headVersion) {
			changed[key] = { from: baseVersion, to: headVersion };
		}
	}

	return { added, removed, changed };
};
