export async function downloadJsonFile(url: string, output: string) {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to download JSON: ${response.status} ${response.statusText}`);
		}
		const jsonData = await response.json();
		await Bun.write(output, JSON.stringify(jsonData, null, 2));
		return { success: true };
	} catch (error) {
		return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred." };
	}
}
