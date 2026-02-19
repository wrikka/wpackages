import { unlink } from "fs/promises";
import { glob } from "glob";
import path from "path";

const projectRoot = path.resolve(import.meta.dir, "../../../");

const pattern = "**/*.js.map";

async function cleanup() {
	console.log("Starting cleanup for .js.map files...");
	const files = await glob(pattern, {
		ignore: "**/dist/**",
		cwd: projectRoot,
		absolute: true,
	});

	console.log(`Found ${files.length} .js.map files.`);

	for (const file of files) {
		try {
			await unlink(file);
			console.log(`Deleted: ${file}`);
		} catch (error) {
			console.error(`Error deleting ${file}:`, error);
		}
	}
	console.log("Cleanup complete.");
}

cleanup();
