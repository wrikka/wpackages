export const clipboard = {
	async read(): Promise<string> {
		if (process.platform === "darwin") {
			const { exec } = await import("node:child_process");
			return new Promise((resolve, reject) => {
				exec("pbpaste", (error: unknown, stdout: string) => {
					if (error) reject(error);
					else resolve(stdout.trim());
				});
			});
		}
		if (process.platform === "win32") {
			const { exec } = await import("node:child_process");
			return new Promise((resolve, reject) => {
				exec("powershell -command Get-Clipboard", (error: unknown, stdout: string) => {
					if (error) reject(error);
					else resolve(stdout.trim());
				});
			});
		}
		const { exec } = await import("node:child_process");
		return new Promise((resolve, reject) => {
			exec("xclip -selection clipboard -o", (error: unknown, stdout: string) => {
				if (error) reject(error);
				else resolve(stdout.trim());
			});
		});
	},

	async write(text: string): Promise<void> {
		if (process.platform === "darwin") {
			const { spawn } = await import("node:child_process");
			return new Promise((resolve, reject) => {
				const child = spawn("pbcopy", []);
				child.stdin.write(text);
				child.stdin.end();
				child.on("error", reject);
				child.on("close", (code) => {
					if (code === 0) resolve();
					else reject(new Error(`pbcopy exited with code ${code}`));
				});
			});
		}
		if (process.platform === "win32") {
			const { exec } = await import("node:child_process");
			await new Promise<void>((resolve, reject) => {
				exec(
					`powershell -command Set-Clipboard -Value '${text.replace(/'/g, "''")}'`,
					(error: unknown) => {
						if (error) reject(error);
						else resolve();
					},
				);
			});
			return;
		}
		const { spawn } = await import("node:child_process");
		return new Promise((resolve, reject) => {
			const child = spawn("xclip", ["-selection", "clipboard"]);
			child.stdin.write(text);
			child.stdin.end();
			child.on("error", reject);
			child.on("close", (code) => {
				if (code === 0) resolve();
				else reject(new Error(`xclip exited with code ${code}`));
			});
		});
	},
};
