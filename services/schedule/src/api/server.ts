import { Effect, Layer } from "effect";
import { DistributedLockManagerLive } from "../services/distributed";
import { EnhancedSchedulerLive } from "../services/enhanced-scheduler.service";
import { EventBusLive } from "../services/event";
import {
	ExecutionRepositoryLive,
	JobRepositoryLive,
	MetricsRepositoryLive,
} from "../services/persistence";
import {
	cancelJobHandler,
	createJobHandler,
	getJobExecutionsHandler,
	getJobHandler,
	getJobMetricsHandler,
	listJobsHandler,
	updateJobHandler,
} from "./routes";

const MainLive = Layer.mergeAll(
	JobRepositoryLive,
	ExecutionRepositoryLive,
	MetricsRepositoryLive,
	DistributedLockManagerLive,
	EventBusLive,
	EnhancedSchedulerLive,
);

export const createServer = (port = 3000) =>
	Effect.suspend(() => {
		const server = Bun.serve({
			port,
			async fetch(request) {
				const url = new URL(request.url);
				const method = request.method;
				const path = url.pathname;

				try {
					if (path === "/jobs" && method === "POST") {
						try {
							return Effect.runSync(
								Effect.provide(createJobHandler(request), MainLive),
							);
						} catch (e) {
							return Response.json({ error: String(e) }, { status: 500 });
						}
					}
					if (path === "/jobs" && method === "GET") {
						try {
							return Effect.runSync(
								Effect.provide(listJobsHandler(), MainLive),
							);
						} catch (e) {
							return Response.json({ error: String(e) }, { status: 500 });
						}
					}
					if (
						path.startsWith("/jobs/") &&
						method === "GET" &&
						!path.includes("/executions") &&
						!path.includes("/metrics")
					) {
						try {
							return Effect.runSync(
								Effect.provide(getJobHandler(request), MainLive),
							);
						} catch (e) {
							return Response.json({ error: String(e) }, { status: 500 });
						}
					}
					if (path.startsWith("/jobs/") && method === "PATCH") {
						try {
							return Effect.runSync(
								Effect.provide(updateJobHandler(request), MainLive),
							);
						} catch (e) {
							return Response.json({ error: String(e) }, { status: 500 });
						}
					}
					if (path.startsWith("/jobs/") && method === "DELETE") {
						try {
							return Effect.runSync(
								Effect.provide(cancelJobHandler(request), MainLive),
							);
						} catch (e) {
							return Response.json({ error: String(e) }, { status: 500 });
						}
					}
					if (path.includes("/executions") && method === "GET") {
						try {
							return Effect.runSync(
								Effect.provide(getJobExecutionsHandler(request), MainLive),
							);
						} catch (e) {
							return Response.json({ error: String(e) }, { status: 500 });
						}
					}
					if (path.includes("/metrics") && method === "GET") {
						try {
							return Effect.runSync(
								Effect.provide(getJobMetricsHandler(request), MainLive),
							);
						} catch (e) {
							return Response.json({ error: String(e) }, { status: 500 });
						}
					}

					return Response.json({ error: "Not found" }, { status: 404 });
				} catch (error) {
					return Response.json({ error: String(error) }, { status: 500 });
				}
			},
		});

		console.log(`Scheduler API server running on http://localhost:${port}`);

		return server;
	});
