import boxen from "boxen";
import { compareVersions } from "compare-versions";
import { Effect } from "effect";
import latestVersion from "latest-version";
import pc from "picocolors";

const PackageNotFound = new Error("Package not found on npm registry.");

export const checkForUpdates = (pkg: { name: string; version: string }): Effect.Effect<void, Error> =>
	Effect.tryPromise({
		try: async () => {
			const latest = await latestVersion(pkg.name);
			if (!latest) {
				throw PackageNotFound;
			}

			if (compareVersions(latest, pkg.version) > 0) {
				const message = [
					`Update available! ${pc.red(pkg.version)} -> ${pc.green(latest)}`,
					`Run ${pc.cyan(`bun upgrade ${pkg.name}`)} to update`,
				].join("\n");

				console.log(
					boxen(message, {
						padding: 1,
						margin: 1,
						borderStyle: "round",
						borderColor: "yellow",
						title: "Update Available",
						titleAlignment: "center",
					}),
				);
			}
		},
		catch: (error: unknown) => new Error(`Failed to check for updates: ${String(error)}`),
	});
