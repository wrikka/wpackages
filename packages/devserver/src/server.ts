import { createApp, createRouter, eventHandler } from "h3";

export function createServer() {
	const app = createApp();
	const router = createRouter();

	router.get(
		"/",
		eventHandler(() => {
			return "<h1>Hello from new DevServer!</h1>";
		}),
	);

	app.use(router);

	return app;
}
