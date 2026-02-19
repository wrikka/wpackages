import { execa } from "execa";

export class ProcessService {
	async runInstall(cwd: string): Promise<void> {
		await execa("bun", ["install"], { stdio: "inherit", cwd });
	}

	async runTests(cwd: string): Promise<void> {
		// This will throw an error if the tests fail, which is the desired behavior.
		await execa("bun", ["test"], { stdio: "inherit", cwd });
	}
}
