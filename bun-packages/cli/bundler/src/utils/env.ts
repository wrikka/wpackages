export function commandExists(command: string): boolean {
	try {
		const proc = Bun.spawnSync([command, "--version"], {
			stdio: ["ignore", "ignore", "ignore"],
		});
		return proc.exitCode === 0;
	} catch {
		return false;
	}
}
