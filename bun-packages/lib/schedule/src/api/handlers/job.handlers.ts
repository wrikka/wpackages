import { Effect, Option } from "effect";
import { CreateJobSchema, UpdateJobSchema } from "../../schemas";
import { EnhancedSchedulerTag } from "../../services/enhanced-scheduler.service";

export const createJobHandler = (request: Request) =>
	Effect.gen(function* () {
		const body = yield* Effect.tryPromise(() => request.json());
		const parsed = yield* CreateJobSchema(body);
		const scheduler = yield* EnhancedSchedulerTag;

		const task = Effect.void;
		const job = yield* scheduler.scheduleJob(parsed.name, parsed.cron, task, {
			priority: parsed.priority,
			retryConfig: parsed.retryConfig,
			timeout: parsed.timeout,
			concurrency: parsed.concurrency,
			data: parsed.data,
		});

		return Response.json({ success: true, job }, { status: 201 });
	}).pipe(
		Effect.catchAll((error) =>
			Effect.succeed(Response.json({ error: String(error) }, { status: 400 })),
		),
	);

export const listJobsHandler = () =>
	Effect.gen(function* () {
		const scheduler = yield* EnhancedSchedulerTag;
		const jobs = yield* scheduler.listJobs();

		return Response.json({ success: true, jobs });
	}).pipe(
		Effect.catchAll((error) =>
			Effect.succeed(Response.json({ error: String(error) }, { status: 500 })),
		),
	);

export const getJobHandler = (request: Request) =>
	Effect.gen(function* () {
		const url = new URL(request.url);
		const jobId = url.pathname.split("/").pop();

		if (!jobId) {
			return Response.json({ error: "Job ID required" }, { status: 400 });
		}

		const scheduler = yield* EnhancedSchedulerTag;
		const job = yield* scheduler.getJob(jobId);

		if (Option.isNone(job)) {
			return Response.json({ error: "Job not found" }, { status: 404 });
		}

		return Response.json({ success: true, job: job.value });
	}).pipe(
		Effect.catchAll((error) =>
			Effect.succeed(Response.json({ error: String(error) }, { status: 500 })),
		),
	);

export const updateJobHandler = (request: Request) =>
	Effect.gen(function* () {
		const url = new URL(request.url);
		const jobId = url.pathname.split("/").pop();

		if (!jobId) {
			return Response.json({ error: "Job ID required" }, { status: 400 });
		}

		const body = yield* Effect.tryPromise(() => request.json());
		const parsed = yield* UpdateJobSchema(body);
		const scheduler = yield* EnhancedSchedulerTag;

		const job = yield* scheduler.updateJob(jobId, parsed);

		return Response.json({ success: true, job });
	}).pipe(
		Effect.catchAll((error) =>
			Effect.succeed(Response.json({ error: String(error) }, { status: 400 })),
		),
	);

export const cancelJobHandler = (request: Request) =>
	Effect.gen(function* () {
		const url = new URL(request.url);
		const jobId = url.pathname.split("/").pop();

		if (!jobId) {
			return Response.json({ error: "Job ID required" }, { status: 400 });
		}

		const scheduler = yield* EnhancedSchedulerTag;
		yield* scheduler.cancelJob(jobId);

		return Response.json({ success: true, message: "Job cancelled" });
	}).pipe(
		Effect.catchAll((error) =>
			Effect.succeed(Response.json({ error: String(error) }, { status: 500 })),
		),
	);

export const getJobExecutionsHandler = (request: Request) =>
	Effect.gen(function* () {
		const url = new URL(request.url);
		const jobId = url.pathname.split("/").slice(-2, -1)[0];
		const limit = Number.parseInt(url.searchParams.get("limit") ?? "100", 10);

		if (!jobId) {
			return Response.json({ error: "Job ID required" }, { status: 400 });
		}

		const scheduler = yield* EnhancedSchedulerTag;
		const executions = yield* scheduler.getJobExecutions(jobId, limit);

		return Response.json({ success: true, executions });
	}).pipe(
		Effect.catchAll((error) =>
			Effect.succeed(Response.json({ error: String(error) }, { status: 500 })),
		),
	);

export const getJobMetricsHandler = (request: Request) =>
	Effect.gen(function* () {
		const url = new URL(request.url);
		const jobId = url.pathname.split("/").slice(-2, -1)[0];

		if (!jobId) {
			return Response.json({ error: "Job ID required" }, { status: 400 });
		}

		const scheduler = yield* EnhancedSchedulerTag;
		const metrics = yield* scheduler.getJobMetrics(jobId);

		if (Option.isNone(metrics)) {
			return Response.json({ error: "Metrics not found" }, { status: 404 });
		}

		return Response.json({ success: true, metrics: metrics.value });
	}).pipe(
		Effect.catchAll((error) =>
			Effect.succeed(Response.json({ error: String(error) }, { status: 500 })),
		),
	);
