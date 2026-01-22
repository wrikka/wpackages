import * as fs from "fs";
import * as path from "path";
import { BUILTIN_MODULES } from "../constant";
import type { BuildPCOptions, FileInfo, MainPackageJson, PackageStructure } from "../types";
import { useAIEnhancement, useAIPackageEnhancement } from "./ai-enhancer";

export const usePackageStructureCreator = () => {
  return (packageName: string, files: FileInfo[]): PackageStructure => {
    return {
      name: packageName,
      files,
    };
  };
};

export const usePackageFileCreator = () => {
  return async (
    packageStructure: PackageStructure,
    outputDir: string,
    detectedDeps: Set<string>,
    options?: BuildPCOptions,
  ): Promise<string> => {
    const packagesDir = path.join(outputDir, packageStructure.name);
    const srcDir = path.join(packagesDir, "src");

    if (!fs.existsSync(packagesDir)) {
      fs.mkdirSync(packagesDir, { recursive: true });
    }
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }

    for (const file of packageStructure.files) {
      const fileName = path.basename(file.path);
      const destPath = path.join(srcDir, fileName);
      fs.writeFileSync(destPath, file.content);
    }

    const currentDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
    const configDir = path.join(currentDir, "..", "config");

    const packageJsonTemplate = fs.readFileSync(path.join(configDir, "package.json"), "utf-8");

    const mainPackageJsonPath = path.join(outputDir, "package.json");
    let mainPackageJson: MainPackageJson = {};

    if (fs.existsSync(mainPackageJsonPath)) {
      try {
        mainPackageJson = JSON.parse(fs.readFileSync(mainPackageJsonPath, "utf-8"));
      } catch (error) {
        console.warn("Could not read main package.json", error instanceof Error ? error.message : String(error));
      }
    }

    const dependencies: Record<string, string> = {};
    for (const dep of detectedDeps) {
      if (!BUILTIN_MODULES.includes(dep as typeof BUILTIN_MODULES[number])) {
        const version = mainPackageJson.dependencies?.[dep]
          || mainPackageJson.devDependencies?.[dep]
          || "^1.0.0";
        dependencies[dep] = version;
      }
    }

    let templatePackageJson: MainPackageJson = {};
    try {
      templatePackageJson = JSON.parse(packageJsonTemplate) as MainPackageJson;
    } catch (error) {
      console.warn(
        "Could not parse package.json template, falling back to minimal package.json",
        error instanceof Error ? error.message : String(error),
      );
      templatePackageJson = {};
    }

    const finalPackageJson: MainPackageJson = {
      ...templatePackageJson,
      name: packageStructure.name,
      description: `Bundled package for ${packageStructure.name}`,
      author: mainPackageJson.author || (templatePackageJson.author as string | undefined) || "Unknown",
      dependencies,
      bin: {
        ...(templatePackageJson as any).bin,
        [packageStructure.name]: "./dist/index.js",
      },
    };

    fs.writeFileSync(path.join(packagesDir, "package.json"), JSON.stringify(finalPackageJson, null, 2));

    const configFiles = ["tsconfig.json", "biome.jsonc", "lefthook.yml", "sea-config.json"];
    for (const configFile of configFiles) {
      const configPath = path.join(configDir, configFile);
      if (fs.existsSync(configPath)) {
        fs.copyFileSync(configPath, path.join(packagesDir, configFile));
      }
    }

    const gitignorePath = path.join(configDir, ".gitignore");
    if (fs.existsSync(gitignorePath)) {
      fs.copyFileSync(gitignorePath, path.join(packagesDir, ".gitignore"));
    }

    const workflowDir = path.join(packagesDir, ".github", "workflows");
    fs.mkdirSync(workflowDir, { recursive: true });
    const workflowTemplatePath = path.join(configDir, ".github", "workflows", "publish.yml");
    if (fs.existsSync(workflowTemplatePath)) {
      fs.copyFileSync(workflowTemplatePath, path.join(workflowDir, "publish.yml"));
    }

    let readme = [
      `# ${packageStructure.name}`,
      "",
      "Bundled package created by BuildPC",
      "",
      "## Files included:",
      ...packageStructure.files.map(f => `- ${path.basename(f.path)}`),
      "",
      "## Usage",
      "",
      "```bash",
      "# Install dependencies",
      "bun install",
      "",
      "# Development",
      "bun run dev",
      "",
      "# Build",
      "bun run build",
      "",
      "# Create Standalone Binary (SEA)",
      "bun run binary",
      "",
      "# Lint",
      "bun run lint",
      "",
      "# Format",
      "bun run format",
      "```",
    ].join("\n");

    if (options?.aiMode && options?.openaiKey) {
      try {
        const enhancedReadme = await useAIEnhancement()(readme, packageStructure, options.openaiKey);
        readme = enhancedReadme;

        const currentPackageJson = JSON.parse(fs.readFileSync(path.join(packagesDir, "package.json"), "utf-8"));
        const enhancedPackageJson = await useAIPackageEnhancement()(
          currentPackageJson,
          packageStructure,
          options.openaiKey,
        );
        fs.writeFileSync(path.join(packagesDir, "package.json"), JSON.stringify(enhancedPackageJson, null, 2));
      } catch (error) {
        console.warn(
          "AI enhancement failed, using default content",
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    fs.writeFileSync(path.join(packagesDir, "README.md"), readme);

    return packagesDir;
  };
};
