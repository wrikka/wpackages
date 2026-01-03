import { PackageService } from "./package.service";
import { ProcessService } from "./process.service";
import { UiService } from "./ui.service";

export class UpdateService {
	private readonly packageService = new PackageService();
	private readonly processService = new ProcessService();
	private readonly uiService = new UiService();

	public updatePackageFiles(selectedPackages: { pkg: string; newVersion: string; pkgPath: string }[]): void {
		const updatesByFile = selectedPackages.reduce((acc, { pkg, newVersion, pkgPath }) => {
			acc[pkgPath] = acc[pkgPath] || [];
			acc[pkgPath].push({ pkg, newVersion });
			return acc;
		}, {} as Record<string, { pkg: string; newVersion: string }[]>);

		for (const [pkgPath, updates] of Object.entries(updatesByFile)) {
			const pkgData = this.packageService.readPackageJson(pkgPath);
			for (const { pkg, newVersion } of updates) {
				if (pkgData.dependencies?.[pkg]) pkgData.dependencies[pkg] = `^${newVersion}`;
				else if (pkgData.devDependencies?.[pkg]) pkgData.devDependencies[pkg] = `^${newVersion}`;
				else if (pkgData.peerDependencies?.[pkg]) pkgData.peerDependencies[pkg] = `^${newVersion}`;
			}
			this.packageService.writePackageJson(pkgPath, pkgData);
		}
		this.uiService.showMessage("package.json files updated.", "green");
	}

	public rollbackChanges(originalContents: Map<string, string>): void {
		for (const [path, content] of originalContents.entries()) {
			this.packageService.writePackageJson(path, JSON.parse(content));
		}
		this.uiService.showMessage("All package.json files have been restored.", "yellow");
	}

	public async runInstallAndTest(rootDir: string, testScriptExists: boolean): Promise<void> {
		await this.processService.runInstall(rootDir);
		this.uiService.showMessage("Dependencies updated successfully!", "green");

		if (testScriptExists) {
			this.uiService.showMessage("Running tests...");
			await this.processService.runTests(rootDir);
			this.uiService.showMessage("All tests passed!", "green");
		}
	}
}
