import * as p from '@clack/prompts';
import axios from 'axios';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { GithubOptionsSchema } from '../types';

function parseGitHubUrl(url: string) {
	const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
	if (!match) return null;

	const [, owner, repo, branch, path] = match;
	return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
}

export async function downloadFromGithub() {
	const options = await p.group(
		{
			url: () => p.text({ message: 'Enter the GitHub file URL:' }),
			output: () => p.text({ message: 'Enter the output filename:' }),
		},
		{
			onCancel: () => {
				p.cancel('Operation cancelled.');
				process.exit(0);
			},
		}
	);

	const parsedOptions = GithubOptionsSchema.safeParse(options);

	if (!parsedOptions.success) {
		p.cancel('Invalid input. Please enter a valid URL and filename.');
		return;
	}

	const rawUrl = parseGitHubUrl(parsedOptions.data.url);

	if (!rawUrl) {
		p.cancel('Invalid GitHub URL format.');
		return;
	}

	const s = p.spinner();
	s.start('Downloading file from GitHub...');

	try {
		const response = await axios.get(rawUrl, { responseType: 'stream' });
		await pipeline(response.data, createWriteStream(parsedOptions.data.output));
		s.stop(`File saved as ${parsedOptions.data.output}`);
	} catch (error) {
		s.stop('Failed to download file.', 500);
		p.note(error instanceof Error ? error.message : 'An unknown error occurred.');
	}
}

