import { spinner } from "@clack/prompts";
import { exec } from "node:child_process";
import pc from "picocolors";

export const ScriptRunnerService = {
	async run(scripts: string[]) {
		for (const script of scripts) {
			const s = spinner();
			s.start(`🚀 Running script: ${pc.cyan(script)}`);
			await new Promise((resolve, reject) => {
				exec(script, (error, stdout, stderr) => {
					if (error) {
						s.stop(`❌ Error running script: ${pc.red(script)}`);
						console.error(stderr);
						return reject(error);
					}
					s.stop(`✅ Script completed: ${pc.green(script)}`);
					console.log(stdout);
					resolve(stdout);
				});
			});
		}
	},
};
