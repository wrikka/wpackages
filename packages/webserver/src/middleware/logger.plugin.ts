import type { Plugin } from "../lib/core";

export const loggerPlugin: Plugin = {
	name: "logger",
	setup: (app) => {
		app.beforeHandle(({ req }) => {
			console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
		});
	},
};
