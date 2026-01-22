interface Options {
	outDir?: string | undefined;
	path?: string | undefined;
}

export async function downloadRepository(repoUrl: string, options: Options) {
	const githubRegex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/[^/]+\/(.+))?$/;
	const match = repoUrl.match(githubRegex);

	if (!match) {
		return {
			success: false,
			error:
				"Invalid GitHub URL. Expected format: https://github.com/user/repo or https://github.com/user/repo/tree/branch/path",
		};
	}

	const [, owner, repo, pathFromUrl] = match;
	if (!owner || !repo) {
		return { success: false, error: "Failed to parse GitHub URL" };
	}

	const specificPath = options.path || pathFromUrl || "";

	let zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;

	try {
		let response = await fetch(zipUrl);
		if (!response.ok) {
			zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/master.zip`;
			response = await fetch(zipUrl);
			if (!response.ok) {
				throw new Error(`Failed to download repository: ${response.status} ${response.statusText}`);
			}
		}

		const arrayBuffer = await response.arrayBuffer();
		const outDir: string = (options.outDir ?? repo) as string;

		const outFile = Bun.file(outDir);
		if (await outFile.exists()) {
			const fs = await import("node:fs");
			fs.rmSync(outDir, { recursive: true, force: true });
		}

		await Bun.$`mkdir -p ${outDir}`;

		const tempZipPath = `${outDir}/__temp__.zip`;
		await Bun.write(tempZipPath, new Uint8Array(arrayBuffer));

		try {
			const result = Bun.spawnSync(["unzip", "-q", tempZipPath, "-d", outDir]);
			if (result.exitCode !== 0) throw new Error("Failed to extract zip file");
		} catch { // error is unused
			try {
				const result = Bun.spawnSync(["7z", "x", tempZipPath, `-o${outDir}`]);
				if (result.exitCode !== 0) throw new Error("Failed to extract zip file with 7z");
			} catch {
				throw new Error("Failed to extract zip file. Please ensure 'unzip' or '7z' is installed.");
			}
		}

		await Bun.$`rm ${tempZipPath}`;

		return { success: true, path: outDir, specificPath };
	} catch (error) {
		return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred." };
	}
}
