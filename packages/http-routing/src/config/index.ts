import { Context, Layer } from "effect";
import type { HttpRoutingEnv } from "../types";

export class HttpRoutingConfig {
	static readonly Current = Context.GenericTag<HttpRoutingConfig>("HttpRoutingConfig");

	constructor(public readonly env: HttpRoutingEnv) {}
}

export const HttpRoutingConfigLive = (env: HttpRoutingEnv) =>
	Layer.succeed(HttpRoutingConfig.Current, new HttpRoutingConfig(env));
