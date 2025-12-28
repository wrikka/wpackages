import { Effect as FunctionalEffect } from "@wts/functional";
import { Effect, Layer } from "@wts/functional";
import type { Effect as EffectType } from "@wts/functional";

export interface Console {
	readonly log: (message: string) => EffectType<void, never, never>;
	readonly info?: (message: string) => EffectType<void, never, never>;
	readonly warn?: (message: string) => EffectType<void, never, never>;
	readonly error?: (message: string) => EffectType<void, never, never>;
}

export const Console = FunctionalEffect.tag<Console>();

export const ConsoleLive = Layer.succeed(Console, {
	log: (message: string) =>
		Effect.tap(Effect.succeed(undefined), () => {
			console.log(message);
		}),
	info: (message: string) =>
		Effect.tap(Effect.succeed(undefined), () => {
			console.info(message);
		}),
	warn: (message: string) =>
		Effect.tap(Effect.succeed(undefined), () => {
			console.warn(message);
		}),
	error: (message: string) =>
		Effect.tap(Effect.succeed(undefined), () => {
			console.error(message);
		}),
});

const callOrLog = (svc: Console, method: keyof Pick<Console, "info" | "warn" | "error">, message: string) => {
	const fn = svc[method];
	return fn ? fn(message) : svc.log(message);
};

export const log = (message: string) =>
	Effect.gen(function*() {
		const svc = yield Effect.get(Console);
		yield svc.log(message);
	});

export const info = (message: string) =>
	Effect.gen(function*() {
		const svc = yield Effect.get(Console);
		yield callOrLog(svc, "info", message);
	});

export const warn = (message: string) =>
	Effect.gen(function*() {
		const svc = yield Effect.get(Console);
		yield callOrLog(svc, "warn", message);
	});

export const error = (message: string) =>
	Effect.gen(function*() {
		const svc = yield Effect.get(Console);
		yield callOrLog(svc, "error", message);
	});
