import * as fs from "node:fs";
import * as path from "node:path";

const SHEBANG = "#!/usr/bin/env node\n";
const DIST_CANDIDATES = ["dist/app.mjs", "dist/app.js"] as const;

const main = () => {
	const distFile = DIST_CANDIDATES
		.map((p) => path.resolve(process.cwd(), p))
		.find((p) => fs.existsSync(p));

	if (!distFile) {
		throw new Error(`dist file not found: ${DIST_CANDIDATES.join(", ")}`);
	}

	const content = fs.readFileSync(distFile, "utf8");
	if (content.startsWith(SHEBANG)) {
		return;
	}

	fs.writeFileSync(distFile, `${SHEBANG}${content}`, "utf8");
};

try {
	main();
} catch (error) {
	console.error(error);
	process.exit(1);
}
