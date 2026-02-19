import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export interface ArtifactInfo {
	file: string;
	bytes: number;
}

export interface BuildSummary {
	durationMs: number;
	artifacts: ArtifactInfo[];
	totalBytes: number;
}

async function listFilesRecursive(root: string): Promise<string[]> {
	const entries = await readdir(root, { withFileTypes: true });
	const files: string[] = [];

	for (const e of entries) {
		const p = path.join(root, e.name);
		if (e.isDirectory()) {
			files.push(...(await listFilesRecursive(p)));
			continue;
		}
		if (e.isFile()) files.push(p);
	}

	return files;
}

export async function collectSummary(outDir: string, startedAtMs: number, endedAtMs: number): Promise<BuildSummary> {
	const durationMs = Math.max(0, endedAtMs - startedAtMs);

	const artifacts: ArtifactInfo[] = [];
	let totalBytes = 0;

	try {
		const files = await listFilesRecursive(outDir);
		for (const f of files) {
			const s = await stat(f);
			artifacts.push({ file: f, bytes: s.size });
			totalBytes += s.size;
		}
	} catch {
		// ignore if outDir does not exist
	}

	return { durationMs, artifacts, totalBytes };
}
