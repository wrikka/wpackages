export type ImportSpecifier = {
	module: string;
	// `*` for namespace, `default` for default, or the named import
	specifiers: Set<string>; 
};

export type ReExport = {
	module: string;
	exportAll: boolean;
	// Map<exportedName, importedName>
	specifiers: Map<string, string>;
};

export type FileNode = {
	path: string;
	imports: ImportSpecifier[];
	reExports: ReExport[];
	exports: Set<string>;
};

export type DependencyGraph = Map<string, FileNode>;

export interface AnalysisResult {
    unusedFiles: string[];
    unusedDependencies: string[];
    unusedExports: Map<string, string[]>; // FilePath -> Unused export names
}

export type PackageAnalysisResult = AnalysisResult & {
	packageName: string;
	cwd: string;
};

export type WorkspaceAnalysisResult = {
	mode: 'workspace';
	root: string;
	packages: PackageAnalysisResult[];
};

export type AnyAnalysisResult = AnalysisResult | WorkspaceAnalysisResult;

export interface AnalyzeOptions {
    cwd: string;
    entrypoints: string[];
    ignore: string[];
	ignoreUnusedFiles?: string[];
	ignoreExports?: string[];
	ignoreDependencies?: string[];
	cache?: boolean;
	cacheFile?: string;
}
