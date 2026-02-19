export async function exportResult(
	filePath: string,
	data: unknown,
	silent: boolean,
) {
	await Bun.write(filePath, JSON.stringify(data, null, 2));
	if (!silent) {
		console.log(`\n✓ Results exported to ${filePath}`);
	}
}
