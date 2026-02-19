import { readdirSync, statSync } from "fs";
import { join } from "path";
import { PackageService } from "./package.service";

export class ScanService {
	private readonly packageService = new PackageService();

	public findPackagePaths(rootDir: string): string[] {
		const rootPkgPath = join(rootDir, "package.json");
		const rootPkgData = this.packageService.readPackageJson(rootPkgPath);
		const isMonorepo = !!rootPkgData.workspaces;

		return isMonorepo
			? this.findPackageJsonsInWorkspaces(rootDir).filter(p => p !== rootPkgPath)
			: [rootPkgPath];
	}

	private findPackageJsonsInWorkspaces(dir: string, ignore: string[] = ["node_modules", ".git", "dist"]): string[] {
		let results: string[] = [];
		try {
			const list = readdirSync(dir);
			for (let file of list) {
				file = join(dir, file);
				if (ignore.some(i => file.includes(i))) {
					continue;
				}
				const stat = statSync(file);
				if (stat && stat.isDirectory()) {
					results = results.concat(this.findPackageJsonsInWorkspaces(file, ignore));
				} else if (file.endsWith("package.json")) {
					results.push(file);
				}
			}
		} catch {
			// Ignore errors
		}
		return results;
	}
}
