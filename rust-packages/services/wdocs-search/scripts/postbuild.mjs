import fs from "fs/promises";

async function postbuild() {
	try {
		// Check if index.js exists before renaming
		await fs.access("index.js");
		await fs.rename("index.js", "index.cjs");
		console.log("Renamed index.js to index.cjs");
	} catch (error) {
		if (error.code === 'ENOENT') {
			console.log("index.js does not exist, skipping rename");
		} else {
			console.error("Error renaming file:", error);
			process.exit(1);
		}
	}
}

postbuild();
