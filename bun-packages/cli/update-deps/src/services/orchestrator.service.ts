import chalk from "chalk";
import { dirname, join } from "path";
import type { Choice } from "../types";
import { DependencyService } from "./dependency.service";
import { InfoService } from "./info.service";
import { PackageService } from "./package.service";
import { ProcessService } from "./process.service";
import { ScanService } from "./scan.service";
import { UiService } from "./ui.service";
import { UpdateService } from "./update.service";

export class OrchestratorService {
	private readonly packageService = new PackageService();
	private readonly dependencyService = new DependencyService();
	private readonly infoService = new InfoService();
	private readonly uiService = new UiService();
	private readonly processService = new ProcessService();
	private readonly scanService = new ScanService();
	private readonly updateService = new UpdateService();

	public async run(): Promise<void> {
		const rootDir = process.cwd();
		this.uiService.showMessage("Scanning for packages...");

		const packagePaths = this.scanService.findPackagePaths(rootDir);
		const rootPkgPath = join(rootDir, "package.json");
		const rootPkgData = this.packageService.readPackageJson(rootPkgPath);

		this.uiService.showMessage(`Found ${packagePaths.length} package(s). Checking for outdated dependencies...`);

		const allOutdated = new Map<string, { pkg: string; oldVersion: string; newVersion: string; pkgPath: string }>();
		const originalPkgContents = new Map<string, string>();

		const checkPromises = packagePaths.map(async (pkgPath) => {
			try {
				const originalContent = this.packageService.readPackageJson(pkgPath);
				const allDependencies = {
					...originalContent.dependencies,
					...originalContent.devDependencies,
					...originalContent.peerDependencies,
				};
				const outdated = await this.dependencyService.findOutdated(pkgPath);
				return { pkgPath, originalContent, allDependencies, outdated };
			} catch (error: any) {
				this.uiService.showMessage(`Skipping ${pkgPath} due to an error: ${error.message}`, "yellow");
				return null;
			}
		});

		const results = await Promise.all(checkPromises);

		for (const result of results) {
			if (!result) continue;
			const { pkgPath, originalContent, allDependencies, outdated } = result;

			originalPkgContents.set(pkgPath, JSON.stringify(originalContent, null, 2) + "\n");

			if (outdated) {
				for (const [pkg, newVersion] of Object.entries(outdated)) {
					if (!allDependencies[pkg]) continue;
					const key = `${pkg}@${dirname(pkgPath).replace(rootDir, "")}`;
					allOutdated.set(key, { pkg, oldVersion: allDependencies[pkg], newVersion, pkgPath });
				}
			}
		}

		if (allOutdated.size === 0) {
			this.uiService.showMessage("All dependencies are up-to-date across all packages!", "green");
			return;
		}

		const packagesToScanForVulns = Array.from(allOutdated.values()).map(({ pkg, newVersion }) => ({
			name: pkg,
			version: newVersion,
		}));
		const vulnerabilityResults = await this.infoService.getVulnerabilityInfo(packagesToScanForVulns);

		const choices: Choice[] = await Promise.all(
			Array.from(allOutdated.values()).map(async (outdated) => {
				const { pkg, oldVersion, newVersion, pkgPath } = outdated;
				const relativePath = dirname(pkgPath).replace(rootDir, "").substring(1) || "./";
				const changelogInfo = await this.infoService.getChangelogInfo(pkg);
				const vulnInfo = vulnerabilityResults[pkg];

				const title =
					`${chalk.cyan(pkg)} in ${chalk.magenta(relativePath)}: ${chalk.red(oldVersion)} -> ${
						chalk.green(newVersion)
					} `
					+ `${vulnInfo ? chalk.red(`(${vulnInfo.summary}) `) : ""}`
					+ `${changelogInfo ? chalk.gray(`(Releases: ${changelogInfo})`) : ""}`;

				return { title, value: outdated };
			}),
		);

		const autoApprove = process.argv.includes("--yes") || process.argv.includes("-y");
		const selectedPackages = autoApprove
			? choices.map(c => c.value)
			: await this.uiService.getPackageSelection(choices);

		if (selectedPackages.length === 0) {
			this.uiService.showMessage("No packages selected for update.", "yellow");
			return;
		}

		this.uiService.showMessage("Updating selected packages...");
		this.updateService.updatePackageFiles(selectedPackages);

		try {
			await this.updateService.runInstallAndTest(rootDir, !!rootPkgData.scripts?.test);
		} catch (error: any) {
			this.uiService.showMessage("An error occurred. Rolling back changes...", "red");
			this.uiService.showMessage(error.message, "red");
			this.updateService.rollbackChanges(originalPkgContents);
			await this.processService.runInstall(rootDir);
			this.uiService.showMessage("Changes have been rolled back.", "yellow");
		}
	}
}
