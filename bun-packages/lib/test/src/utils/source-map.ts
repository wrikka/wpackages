import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { SourceMapConsumer } from "source-map";

interface StackFrame {
	file: string;
	line: number;
	column: number;
	function?: string;
}

interface SourceMapInfo {
	sourcemap: any;
	mappedPath?: string;
}

const sourceMapCache = new Map<string, SourceMapInfo>();

function loadSourceMap(filePath: string): SourceMapInfo | null {
	if (sourceMapCache.has(filePath)) {
		return sourceMapCache.get(filePath)!;
	}

	try {
		// Try to find .map file
		const mapPath = `${filePath}.map`;
		const mapContent = readFileSync(mapPath, "utf8");
		const sourcemap = JSON.parse(mapContent);

		const info: SourceMapInfo = { sourcemap };
		sourceMapCache.set(filePath, info);
		return info;
	} catch {
		// Try inline source map
		try {
			const content = readFileSync(filePath, "utf8");
			const mapMatch = content.match(/\/\/# sourceMappingURL=data:application\/json;base64,(.+)/);
			if (mapMatch) {
				const mapData = Buffer.from(mapMatch[1], "base64").toString("utf8");
				const sourcemap = JSON.parse(mapData);
				const info: SourceMapInfo = { sourcemap };
				sourceMapCache.set(filePath, info);
				return info;
			}
		} catch {
			// No source map found
		}
	}

	sourceMapCache.set(filePath, { sourcemap: null });
	return null;
}

function parseStackLine(line: string): StackFrame | null {
	// Match patterns like:
	// at Object.<anonymous> (/path/to/file.js:10:15)
	// at functionName (/path/to/file.js:10:15)
	// at /path/to/file.js:10:15
	const match = line.match(/at\s+(?:.*?\s+)?\(?([^\s]+):(\d+):(\d+)\)?/);
	if (!match) return null;

	const [, file, lineStr, columnStr] = match;
	return {
		file: file.startsWith("file://") ? fileURLToPath(file) : file,
		line: parseInt(lineStr, 10),
		column: parseInt(columnStr, 10),
	};
}

export function mapStackTrace(stack: string): string {
	const lines = stack.split("\n");
	const mappedLines: string[] = [];

	for (const line of lines) {
		const frame = parseStackLine(line);
		if (!frame) {
			mappedLines.push(line);
			continue;
		}

		const sourceMapInfo = loadSourceMap(frame.file);
		if (!sourceMapInfo?.sourcemap) {
			mappedLines.push(line);
			continue;
		}

		try {
			const consumer = new SourceMapConsumer(sourceMapInfo.sourcemap);
			const position = consumer.originalPositionFor({
				line: frame.line,
				column: frame.column,
			});

			if (position.source && position.line !== null && position.column !== null) {
				const sources = sourceMapInfo.sourcemap.sources;
				const sourceIndex = sources.indexOf(position.source);
				const sourceRoot = sourceMapInfo.sourcemap.sourceRoot || "";
				const originalFile = sourceIndex >= 0
					? `${sourceRoot}/${sources[sourceIndex]}`
					: position.source;

				const functionName = position.name || frame.function || "unknown";
				mappedLines.push(
					`    at ${functionName} (${originalFile}:${position.line}:${position.column})`,
				);
			} else {
				mappedLines.push(line);
			}

			consumer.destroy();
		} catch {
			// If source map parsing fails, fall back to original line
			mappedLines.push(line);
		}
	}

	return mappedLines.join("\n");
}

export function enhanceErrorWithSourceMap(error: Error): Error {
	if (error.stack) {
		error.stack = mapStackTrace(error.stack);
	}
	return error;
}

export function createSourceMappedError(message: string, originalError?: Error): Error {
	const error = new Error(message);

	if (originalError?.stack) {
		error.stack = mapStackTrace(originalError.stack);
	} else if (Error.captureStackTrace) {
		Error.captureStackTrace(error);
		error.stack = mapStackTrace(error.stack);
	}

	return error;
}
