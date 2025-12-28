import { Effect as FunctionalEffect } from "@wts/functional";
import { Effect, Layer } from "@wts/functional";
import type { Effect as EffectType } from "@wts/functional";

export type WatchEvent = {
	readonly type: "change" | "rename";
	readonly filename: string;
};

export interface HotReload {
	readonly watch: (paths: ReadonlyArray<string>) => EffectType<AsyncIterable<WatchEvent>, Error, never>;
}

export const HotReload = FunctionalEffect.tag<HotReload>();

type BunWatcher = {
	readonly close: () => void;
};

type BunWatchOptions = {
	readonly paths: Array<string>;
	readonly onChange: (event: WatchEvent["type"], path: string) => void;
};

const getBunWatch = (): ((options: BunWatchOptions) => BunWatcher) | undefined => {
	const bun = (globalThis as unknown as { readonly Bun?: unknown }).Bun;
	if (!bun) return undefined;
	const watch = (bun as { readonly watch?: unknown }).watch;
	if (typeof watch !== "function") return undefined;
	return watch as (options: BunWatchOptions) => BunWatcher;
};

const watchWithBun = async (paths: ReadonlyArray<string>): Promise<AsyncIterable<WatchEvent>> => {
	const queue: Array<WatchEvent> = [];
	let resolveNext: ((v: IteratorResult<WatchEvent>) => void) | undefined;

	const push = (ev: WatchEvent) => {
		if (resolveNext) {
			resolveNext({ value: ev, done: false });
			resolveNext = undefined;
			return;
		}
		queue.push(ev);
	};

	const bunWatch = getBunWatch();
	if (!bunWatch) throw new Error("Bun.watch is not available");

	const watcher = bunWatch({
		paths: [...paths],
		onChange: (event: WatchEvent["type"], path: string) => {
			push({ type: event, filename: path });
		},
	});

	return {
		[Symbol.asyncIterator]() {
			return {
				next() {
					const item = queue.shift();
					if (item) return Promise.resolve({ value: item, done: false });
					return new Promise<IteratorResult<WatchEvent>>((resolve) => {
						resolveNext = resolve;
					});
				},
				return() {
					watcher.close();
					return Promise.resolve({ value: undefined, done: true } as IteratorResult<WatchEvent>);
				},
			};
		},
	};
};

const watchWithNode = async (paths: ReadonlyArray<string>): Promise<AsyncIterable<WatchEvent>> => {
	const { watch } = await import("node:fs");
	const queue: Array<WatchEvent> = [];
	let resolveNext: ((v: IteratorResult<WatchEvent>) => void) | undefined;
	const watchers = paths.map((p) =>
		watch(p, { recursive: true }, (eventType, filename) => {
			const name = filename ? String(filename) : p;
			const type = eventType === "rename" ? "rename" : "change";
			const ev: WatchEvent = { type, filename: name };
			if (resolveNext) {
				resolveNext({ value: ev, done: false });
				resolveNext = undefined;
				return;
			}
			queue.push(ev);
		}),
	);

	return {
		[Symbol.asyncIterator]() {
			return {
				next() {
					const item = queue.shift();
					if (item) return Promise.resolve({ value: item, done: false });
					return new Promise<IteratorResult<WatchEvent>>((resolve) => {
						resolveNext = resolve;
					});
				},
				return() {
					for (const w of watchers) w.close();
					return Promise.resolve({ value: undefined, done: true } as IteratorResult<WatchEvent>);
				},
			};
		},
	};
};

export const HotReloadLive = Layer.succeed(HotReload, {
	watch: (paths) =>
		Effect.fromPromise(async () => {
			if (paths.length === 0) throw new Error("paths must not be empty");
			if (getBunWatch()) {
				return watchWithBun(paths);
			}
			return watchWithNode(paths);
		}),
});

export const watch = (paths: ReadonlyArray<string>) =>
	Effect.gen(function* () {
		const svc = yield Effect.get(HotReload);
		return yield svc.watch(paths);
	});
