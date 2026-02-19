import fs from "fs/promises";

async function postbuild() {
	try {
		await fs.rename("index.js", "index.cjs");
		console.log("Renamed index.js to index.cjs");
	} catch (error) {
		console.error("Error renaming file:", error);
		process.exit(1);
	}
}

postbuild();
