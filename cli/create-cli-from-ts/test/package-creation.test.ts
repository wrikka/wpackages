import * as fs from "fs";
import * as path from "path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { buildPackageLogic } from "../src/useBuildPackage";

// Mock the installer to prevent actual bun install during tests
vi.mock("../src/logic/installer", () => ({
  useAutoInstaller: () => vi.fn().mockResolvedValue(undefined),
}));

describe("Package Creation Logic", () => {
  const testDir = path.join(__dirname, "test-output");
  const packageName = "my-test-cli";
  const entryFilePath = path.join(testDir, "entry.ts");
  const packagePath = path.join(process.cwd(), packageName);

  beforeAll(() => {
    // Create a temporary directory and a dummy entry file
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
    fs.writeFileSync(entryFilePath, "console.log(\"hello world\");");
  });

  afterAll(() => {
    // Cleanup the created directories
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    if (fs.existsSync(packagePath)) {
      fs.rmSync(packagePath, { recursive: true, force: true });
    }
  });

  it("should generate a package with binary compilation and publish workflow features", async () => {
    await buildPackageLogic(entryFilePath, packageName, { aiMode: false });

    // 1. Check for binary compilation features in package.json
    const packageJsonPath = path.join(packagePath, "package.json");
    expect(fs.existsSync(packageJsonPath)).toBe(true);

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

    expect(packageJson.devDependencies).toHaveProperty("postject");
    expect(packageJson.scripts).toHaveProperty("binary");

    // 2. Check for the sea-config.json file
    const seaConfigPath = path.join(packagePath, "sea-config.json");
    expect(fs.existsSync(seaConfigPath)).toBe(true);

    // 3. Check for the GitHub Actions workflow file
    const workflowPath = path.join(packagePath, ".github", "workflows", "publish.yml");
    expect(fs.existsSync(workflowPath)).toBe(true);
  });
});
