import { resolve } from "node:path";
import cron from "node-cron";
import type { WServerOptions } from "../types";

export function setupTasks(options: WServerOptions) {
	if (!options.tasks || !options.features?.cron) return;

	console.log("[wserver] Setting up cron jobs...");
	for (const task of options.tasks) {
		if (task.schedule && cron.validate(task.schedule)) {
			cron.schedule(task.schedule, async () => {
				try {
					const handler = await import(resolve(process.cwd(), task.handler));
					await handler.default();
					console.log(`[wserver] Executed cron job: ${task.handler}`);
				} catch (error) {
					console.error(
						`[wserver] Error executing cron job: ${task.handler}`,
						error,
					);
				}
			});
			console.log(
				`[wserver] Scheduled cron job: ${task.handler} with schedule "${task.schedule}"`,
			);
		}
	}
}
