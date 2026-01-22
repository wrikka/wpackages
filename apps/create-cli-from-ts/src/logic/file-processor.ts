import * as fs from "fs";
import * as path from "path";
import { extractImports } from "../components/import-extractor";
import { FILE_EXTENSIONS } from "../constant";
import type { BundleState, FileInfo } from "../types";

export const useImportExtraction = () => {
  return extractImports;
};

export const usePathResolver = () => {
  return (importPath: string, currentFile: string): string | null => {
    if (importPath.startsWith(".")) {
      const currentDir = path.dirname(currentFile);
      const resolved = path.resolve(currentDir, importPath);

      for (const ext of FILE_EXTENSIONS) {
        const withExt = resolved + ext;
        if (fs.existsSync(withExt)) {
          return withExt;
        }
      }

      for (const ext of FILE_EXTENSIONS) {
        const indexFile = path.join(resolved, `index${ext}`);
        if (fs.existsSync(indexFile)) {
          return indexFile;
        }
      }
    }
    return null;
  };
};

export const useFileProcessor = (state: BundleState) => {
  const extractImports = useImportExtraction();
  const resolvePath = usePathResolver();

  const processFile = async (filePath: string): Promise<void> => {
    if (state.processedFiles.has(filePath) || !fs.existsSync(filePath)) {
      return;
    }

    state.processedFiles.add(filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    const { imports, dependencies } = extractImports(content);

    dependencies.forEach(dep => state.detectedDependencies.add(dep));

    const fileInfo: FileInfo = {
      path: filePath,
      content,
      imports,
    };

    state.allFiles.push(fileInfo);

    for (const importPath of imports) {
      const resolvedPath = resolvePath(importPath, filePath);
      if (resolvedPath) {
        await processFile(resolvedPath);
      }
    }
  };

  return processFile;
};
