import { defineConfig } from "vite";
import wserver from "./src";

export default defineConfig(({ mode }) => ({
	plugins: [
		wserver({
			runtime: {
				env: mode,
				port: 3000,
			},
			features: {
				pages: true,
				api: true,
				websocket: true,
				cron: true,
			},
			routing: {
				pages: { directory: "src/routes" },
				api: { directory: "src/server/api", prefix: "/api" },
				websocket: { directory: "src/server/ws", prefix: "/ws" },
			},
			server: {
				middleware: [
					// { route: '/api/**', handler: '~/server/middleware/logger.ts' }
				],
			},
			auth: {
				strategy: "jwt",
				jwt: {
					secret: process.env.JWT_SECRET ?? "dev-secret",
					expiresIn: "1d",
				},
				// oauth: { github: { clientId: '...', clientSecret: '...' } }
			},
			tasks: [
				// { schedule: '0 * * * *', handler: '~/server/tasks/cleanup.ts' }
			],
			data: {
				storage: {
					cache: { driver: "memory" },
					redis: {
						driver: "redis",
						url: process.env.REDIS_URL ?? "redis://localhost:6379",
					},
				},
				database: {
					default: "postgres",
					connections: {
						postgres: {
							driver: "postgresql",
							url:
								process.env.DATABASE_URL ??
								"postgresql://postgres:postgres@localhost:5432/postgres",
						},
					},
				},
			},
			security: {
				cors: { origin: "*" },
			},
			log: {
				level: "info",
			},
		}),
	],
}));
