import * as p from '@clack/prompts';
import axios from 'axios';
import { createWriteStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { UrlOptionsSchema } from '../types';

export async function downloadFileFromUrl() {
	const options = await p.group(
		{
			url: () => p.text({ message: 'Enter the URL of the file:' }),
			output: () => p.text({ message: 'Enter the output filename:' }),
		},
		{
			onCancel: () => {
				p.cancel('Operation cancelled.');
				process.exit(0);
			},
		}
	);

	const parsedOptions = UrlOptionsSchema.safeParse(options);

	if (!parsedOptions.success) {
		p.cancel('Invalid input. Please enter a valid URL and filename.');
		return;
	}

	const s = p.spinner();
	s.start('Downloading file...');

	try {
		const response = await axios.get(parsedOptions.data.url, { responseType: 'stream' });
		await pipeline(response.data, createWriteStream(parsedOptions.data.output));
		s.stop(`File saved as ${parsedOptions.data.output}`);
	} catch (error) {
		s.stop('Failed to download file.', 500);
		p.note(error instanceof Error ? error.message : 'An unknown error occurred.');
	}
}
