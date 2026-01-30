import * as fs from "node:fs";
import * as path from "node:path";

const SHEBANG = "#!/usr/bin/env node\n";
const DIST_CANDIDATES = ["dist/index.mjs", "dist/index.js"] as const;

const main = async () => {
  const distFile = DIST_CANDIDATES
    .map(p => path.resolve(process.cwd(), p))
    .find(p => fs.existsSync(p));

  if (!distFile) {
    throw new Error(`dist file not found: ${DIST_CANDIDATES.join(", ")}`);
  }

  const content = fs.readFileSync(distFile, "utf8");
  if (content.startsWith(SHEBANG)) {
    return;
  }

  fs.writeFileSync(distFile, `${SHEBANG}${content}`, "utf8");
};

main().catch(error => {
  console.error(error);
  process.exit(1);
});
