import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BUN_PACKAGES_DIR = join(__dirname, "..", "..", "bun-packages");
const TARGET_LINT_SCRIPT = "tsc --noEmit && biome lint --write && oxlint --fix --type-aware";

async function findPackageJsonFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory() && !entry.name.startsWith("node_modules")) {
        files.push(...await findPackageJsonFiles(fullPath));
      } else if (entry.isFile() && entry.name === "package.json") {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore directories that can't be read
  }

  return files;
}

async function updateLintScript(packageJsonPath: string): Promise<boolean> {
  try {
    const content = await readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(content);

    if (!packageJson.scripts) {
      return false;
    }

    const originalLintScript = packageJson.scripts.lint;
    packageJson.scripts.lint = TARGET_LINT_SCRIPT;

    await writeFile(packageJsonPath, JSON.stringify(packageJson, null, "\t") + "\n");

    if (originalLintScript !== TARGET_LINT_SCRIPT) {
      console.log(`✅ Updated: ${packageJsonPath}`);
      console.log(`   Before: ${originalLintScript || "undefined"}`);
      console.log(`   After:  ${TARGET_LINT_SCRIPT}`);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Error updating ${packageJsonPath}:`, error);
    return false;
  }
}

async function main() {
  console.log("🔍 Finding package.json files in bun-packages...");

  const packageJsonFiles = await findPackageJsonFiles(BUN_PACKAGES_DIR);
  console.log(`📦 Found ${packageJsonFiles.length} package.json files`);

  let updatedCount = 0;

  for (const packageJsonPath of packageJsonFiles) {
    const updated = await updateLintScript(packageJsonPath);
    if (updated) {
      updatedCount++;
    }
  }

  console.log(`\n✨ Updated ${updatedCount} package.json files`);
  console.log(`🎯 All lint scripts now use: ${TARGET_LINT_SCRIPT}`);
}

await main().catch(console.error);
