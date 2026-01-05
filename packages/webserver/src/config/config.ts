import { Context, Effect, Layer } from "effect";
import { type Env, loadEnv } from "./env";

export class Config {
	static readonly Current = Context.GenericTag<Config>("Config");
	constructor(public readonly env: Env) {}
}

export const ConfigLive = Layer.effect(
	Config.Current,
	Effect.sync(() => new Config(loadEnv())),
);
