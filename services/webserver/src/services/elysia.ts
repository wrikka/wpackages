import { Elysia } from "elysia";
import type { RouteHandler, Middleware } from "../types";

export class ElysiaServer {
	private app: Elysia;
	private port: number;
	private host: string;

	constructor(config: { port?: number; host?: string } = {}) {
		this.port = config.port ?? 3000;
		this.host = config.host ?? "localhost";
		this.app = new Elysia();
	}

	get(path: string, handler: RouteHandler): this {
		this.app.get(path, async ({ request, params }) => {
			return await handler(request, params);
		});
		return this;
	}

	post(path: string, handler: RouteHandler): this {
		this.app.post(path, async ({ request, params }) => {
			return await handler(request, params);
		});
		return this;
	}

	put(path: string, handler: RouteHandler): this {
		this.app.put(path, async ({ request, params }) => {
			return await handler(request, params);
		});
		return this;
	}

	delete(path: string, handler: RouteHandler): this {
		this.app.delete(path, async ({ request, params }) => {
			return await handler(request, params);
		});
		return this;
	}

	patch(path: string, handler: RouteHandler): this {
		this.app.patch(path, async ({ request, params }) => {
			return await handler(request, params);
		});
		return this;
	}

	use(middleware: Middleware): this {
		this.app.use(async ({ request }) => {
			return await middleware(request, async () => {
				return new Response();
			});
		});
		return this;
	}

	async start(): Promise<void> {
		await this.app.listen(this.port);
		console.log(`🦊 Elysia is running at http://${this.host}:${this.port}`);
	}

	async stop(): Promise<void> {
		if (this.app.server) {
			this.app.server.stop();
			console.log("Elysia stopped");
		}
	}
}

export const createElysiaServer = (config: { port?: number; host?: string } = {}): ElysiaServer => {
	return new ElysiaServer(config);
};
