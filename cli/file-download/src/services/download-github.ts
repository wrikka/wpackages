import { parseGitHubUrl } from "../utils/github";

export async function downloadGithubFile(url: string, output: string) {
	const rawUrl = parseGitHubUrl(url);
	if (!rawUrl) {
		return { success: false, error: "Invalid GitHub URL format." };
	}

	try {
		const response = await fetch(rawUrl);
		if (!response.ok) {
			throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
		}
		await Bun.write(output, response);
		return { success: true };
	} catch (error) {
		return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred." };
	}
}
