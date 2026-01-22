export function parseGitHubUrl(url: string) {
	const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
	if (!match) return null;

	const [, owner, repo, branch, path] = match;
	return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}
