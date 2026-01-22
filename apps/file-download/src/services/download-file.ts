export async function downloadFile(url: string, output: string) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
		}
		await Bun.write(output, response);
		return { success: true };
	} catch (error) {
		return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred." };
	}
}
