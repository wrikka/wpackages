import * as fs from "node:fs";
import * as path from "node:path";

const SHEBANG = "#!/usr/bin/env node\n";
const DIST_CANDIDATES = [
	"dist/index.mjs",
	"dist/index.js",
	"dist/bin/wdgithub.mjs",
	"dist/bin/wdgithub.js",
] as const;

const main = async () => {
	for (const candidate of DIST_CANDIDATES) {
		const distFile = path.resolve(process.cwd(), candidate);
		if (!fs.existsSync(distFile)) {
			continue;
		}

		const content = fs.readFileSync(distFile, "utf8");
		if (content.startsWith(SHEBANG)) {
			continue;
		}

		fs.writeFileSync(distFile, `${SHEBANG}${content}`, "utf8");
	}
};

main().catch(error => {
	console.error(error);
	process.exit(1);
});
