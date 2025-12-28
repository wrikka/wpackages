/**
 * Pure function to extract imports from source code
 */

/**
 * Extract imports and dependencies from source code
 * @param content - Source code content
 * @returns Object with imports array and dependencies array
 */
export function extractImports(content: string): {
  imports: string[];
  dependencies: string[];
} {
  const imports: string[] = [];
  const dependencies: string[] = [];
  const importRegex = /import\s+.*?from\s+['"]([^'"]+)['"];?/g;
  const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath) {
      imports.push(importPath);

      // Detect external dependencies (not relative paths)
      if (!importPath.startsWith(".") && !importPath.startsWith("/")) {
        const packageName = extractPackageName(importPath);
        if (packageName) {
          dependencies.push(packageName);
        }
      }
    }
  }

  while ((match = requireRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath) {
      imports.push(importPath);

      if (!importPath.startsWith(".") && !importPath.startsWith("/")) {
        const packageName = extractPackageName(importPath);
        if (packageName) {
          dependencies.push(packageName);
        }
      }
    }
  }

  return { imports, dependencies };
}

/**
 * Extract package name from import path (handles scoped packages)
 * @param importPath - Import path
 * @returns Package name or null
 */
export function extractPackageName(importPath: string): string | null {
  if (importPath.startsWith("@")) {
    const parts = importPath.split("/");
    return parts.slice(0, 2).join("/");
  }
  return importPath.split("/")[0] || null;
}
