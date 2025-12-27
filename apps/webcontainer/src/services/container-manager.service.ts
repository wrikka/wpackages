// import { pipe2 } from "operators"; // TODO: operators not available
// import { find } from "utils"; // TODO: utils not available
import { Context, Effect, Layer } from "effect";
// import type { ContainerConfig, ContainerInfo } from "../schema"; // TODO: schema not available

// Stub types
type ContainerConfig = any;
type ContainerInfo = any;
import { WebContainerService, WebContainerServiceLive } from "./webcontainer.service";

type ContainerEntry = {
	readonly id: string;
	readonly service: any; // WebContainerService.Service - Effect-TS type compatibility
	readonly layer: Layer.Layer<WebContainerService, unknown, unknown>;
};

export class ContainerManagerService extends Context.Tag(
	"ContainerManagerService",
)<
	ContainerManagerService,
	{
		readonly create: (config: ContainerConfig) => Effect.Effect<string, unknown>;
		readonly createAndStart: (
			config: ContainerConfig,
		) => Effect.Effect<string, unknown>;
		readonly get: (
			id: string,
		) => Effect.Effect<any, unknown>;
		readonly getByName: (
			name: string,
		) => Effect.Effect<any, unknown>;
		readonly getAll: () => readonly any[];
		readonly getAllInfo: () => Effect.Effect<readonly ContainerInfo[], unknown>;
		readonly stop: (id: string) => Effect.Effect<void, unknown>;
		readonly stopAll: () => Effect.Effect<void, unknown>;
		readonly remove: (id: string) => Effect.Effect<void, unknown>;
		readonly removeAll: () => Effect.Effect<void, unknown>;
		readonly count: () => number;
		readonly countRunning: () => number;
	}
>() {}

const make = Effect.sync(() => {
	const containers = new Map<string, ContainerEntry>();

	return {
		count: () => containers.size,

		countRunning: () =>
			Array.from(containers.values()).filter((e) => e.service.isRunning())
				.length,
		create: (config: ContainerConfig) =>
			Effect.gen(function*() {
				const layer = WebContainerServiceLive(config);
				const service = yield* Effect.provide(WebContainerService, layer);
				const info = service.getInfo();

				containers.set(info.id, { id: info.id, layer, service });
				return info.id;
			}),

		createAndStart: (config: ContainerConfig) =>
			Effect.gen(function*() {
				const id = yield* Effect.gen(function*() {
					const layer = WebContainerServiceLive(config);
					const service = yield* Effect.provide(WebContainerService, layer);
					const info = service.getInfo();

					containers.set(info.id, { id: info.id, layer, service });
					return info.id;
				});

				const entry = containers.get(id);
				if (!entry) {
					yield* Effect.fail(new Error(`Container ${id} not found`));
					return id; // unreachable but satisfies type checker
				}

				yield* entry.service.start();
				return id;
			}),

		get: (id: string) =>
			Effect.gen(function*() {
				const entry = containers.get(id);
				if (!entry) {
					yield* Effect.fail(new Error(`Container ${id} not found`));
					return null as any; // unreachable but satisfies type checker
				}
				return entry.service;
			}),

		getAll: () => Array.from(containers.values()).map((e) => e.service),

		getAllInfo: () => Effect.sync(() => Array.from(containers.values()).map((e) => e.service.getInfo())),

		getByName: (name: string) =>
			Effect.gen(function*() {
				const entry = Array.from(containers.values()).find(
					(e) => e.service.getInfo().name === name,
				);

				if (!entry) {
					yield* Effect.fail(new Error(`Container '${name}' not found`));
					return null as any; // unreachable but satisfies type checker
				}

				return entry.service;
			}),

		remove: (id: string) =>
			Effect.gen(function*() {
				const entry = containers.get(id);
				if (!entry) {
					yield* Effect.fail(new Error(`Container ${id} not found`));
					return; // unreachable but satisfies type checker
				}

				if (entry.service.isRunning()) {
					yield* entry.service.stop();
				}

				containers.delete(id);
			}),

		removeAll: () =>
			Effect.gen(function*() {
				yield* Effect.all(
					Array.from(containers.values()).map((e) => e.service.stop()),
					{ concurrency: "unbounded" },
				);
				containers.clear();
			}),

		stop: (id: string) =>
			Effect.gen(function*() {
				const entry = containers.get(id);
				if (!entry) {
					yield* Effect.fail(new Error(`Container ${id} not found`));
					return; // unreachable but satisfies type checker
				}
				yield* entry.service.stop();
			}),

		stopAll: () =>
			Effect.all(
				Array.from(containers.values()).map((e) => e.service.stop()),
				{ concurrency: "unbounded" },
			).pipe(Effect.asVoid),
	};
});

export const ContainerManagerServiceLive = Layer.effect(
	ContainerManagerService,
	make as any, // Type assertion for Effect-TS compatibility
);
