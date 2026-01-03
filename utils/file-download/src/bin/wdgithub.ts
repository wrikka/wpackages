#!/usr/bin/env bun

interface Options {
	outDir?: string | undefined;
	path?: string | undefined;
}

export async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
		console.log(`
Usage: wdgithub <repository-url> [options]

Download GitHub repositories without git history

Arguments:
  repository-url     GitHub repository URL
  
Options:
  -o, --out-dir <dir>   Output directory
  -p, --path <path>     Specific path to download from the repository
  -h, --help           Display help for command

Examples:
  wdgithub https://github.com/user/repo
  wdgithub https://github.com/user/repo -o my-folder
  wdgithub https://github.com/user/repo/tree/main/src -p src
    `);
		process.exit(0);
	}

	const repoUrl = args[0];
	if (!repoUrl) {
		console.error("Error: Repository URL is required");
		process.exit(1);
	}

	const options: Options = {};

	for (let i = 1; i < args.length; i++) {
		if ((args[i] === "-o" || args[i] === "--out-dir") && i + 1 < args.length) {
			options.outDir = args[i + 1] ?? undefined;
			i++;
		} else if (
			(args[i] === "-p" || args[i] === "--path")
			&& i + 1 < args.length
		) {
			options.path = args[i + 1] ?? undefined;
			i++;
		}
	}

	try {
		await downloadRepository(repoUrl, options);
	} catch (error) {
		console.error("Error:", error);
		process.exit(1);
	}
}

async function downloadRepository(repoUrl: string, options: Options) {
	const githubRegex = /^https:\/\/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/[^/]+\/(.+))?$/;
	const match = repoUrl.match(githubRegex);

	if (!match) {
		throw new Error(
			"Invalid GitHub URL. Expected format: https://github.com/user/repo or https://github.com/user/repo/tree/branch/path",
		);
	}

	const [, owner, repo, pathFromUrl] = match;
	if (!owner || !repo) {
		throw new Error("Failed to parse GitHub URL");
	}

	const specificPath = options.path || pathFromUrl || "";

	let zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
	console.log(`Downloading ${owner}/${repo}...`);

	let response = await fetch(zipUrl);
	if (!response.ok) {
		zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/master.zip`;
		response = await fetch(zipUrl);
		if (!response.ok) {
			throw new Error(
				`Failed to download repository: ${response.status} ${response.statusText}`,
			);
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

		if (result.exitCode !== 0) {
			throw new Error("Failed to extract zip file");
		}
	} catch (error) {
		console.debug(
			"unzip failed, trying 7z:",
			error instanceof Error ? error.message : String(error),
		);
		try {
			const result = Bun.spawnSync(["7z", "x", tempZipPath, `-o${outDir}`]);

			if (result.exitCode !== 0) {
				throw new Error("Failed to extract zip file with 7z");
			}
		} catch {
			throw new Error(
				"Failed to extract zip file. Please ensure 'unzip' or '7z' is installed on your system.",
			);
		}
	}

	await Bun.$`rm ${tempZipPath}`;

	console.log(`Successfully downloaded ${owner}/${repo} to ${outDir}`);

	if (specificPath) {
		console.log(`Selected path: ${specificPath}`);
	}
}

if (import.meta.main) {
	await main();
}
