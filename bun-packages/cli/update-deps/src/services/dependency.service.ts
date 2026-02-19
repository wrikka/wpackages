import { run } from "npm-check-updates";
import type { OutdatedDependency } from "../types";

export class DependencyService {
	async findOutdated(packageFilePath: string): Promise<OutdatedDependency | undefined> {
		try {
			const outdated = await run({
				packageFile: packageFilePath,
				jsonUpgraded: true, // Ensure the output is JSON
			});
			return outdated as OutdatedDependency | undefined;
		} catch (error) {
			console.error(`Error checking dependencies for ${packageFilePath}:`, error);
			return undefined;
		}
	}
}
