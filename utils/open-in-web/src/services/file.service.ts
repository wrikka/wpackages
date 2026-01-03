export async function readFileContent(filePath: string): Promise<string> {
	const file = Bun.file(filePath);
	if (!(await file.exists())) {
		throw new Error(`File not found at ${filePath}`);
	}
	return file.text();
}

export async function writeFileContent(filePath: string, content: string): Promise<void> {
	await Bun.write(filePath, content);
}

export function isUrl(path: string): boolean {
	return path.startsWith("http://") || path.startsWith("https://");
}

export async function readFileFromUrl(url: string): Promise<string> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch from URL: ${response.status} ${response.statusText}`);
		}
		return response.text();
	} catch (error) {
		console.error(`\n❌ Error fetching from URL: ${url}`);
		throw error;
	}
}
