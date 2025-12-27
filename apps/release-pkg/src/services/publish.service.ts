import { executeCommandStrict, executeCommand, isCommandSuccess } from "../utils/command";

export class PublishService {
	async publish(tag = "latest", registry?: string): Promise<void> {
		const args = ["publish", "--access", "public", "--tag", tag];
		if (registry) {
			args.push("--registry", registry);
		}
		await executeCommandStrict("npm", args);
	}

	async isPublished(packageName: string, version: string): Promise<boolean> {
		const result = await executeCommand(
			"npm",
			["view", `${packageName}@${version}`, "version"],
		);
		return isCommandSuccess(result.exitCode) && result.stdout.trim() === version;
	}

	async getLatestVersion(packageName: string): Promise<string | null> {
		const result = await executeCommand("npm", ["view", packageName, "version"]);
		return isCommandSuccess(result.exitCode) ? result.stdout.trim() : null;
	}
}
