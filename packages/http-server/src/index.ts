import { Context, Layer } from "effect";

export type ResponseFactoryOptions = {
	readonly withSecurityHeaders?: boolean;
};

export class ResponseFactory extends Context.Tag("ResponseFactory")<
	ResponseFactory,
	{
		readonly options: ResponseFactoryOptions;
	}
>() {}

export const ResponseFactoryLive = (options: ResponseFactoryOptions) =>
	Layer.succeed(
		ResponseFactory,
		ResponseFactory.of({
			options,
		}),
	);

export type HttpRoutingConfigInput = Record<string, unknown>;

export class HttpRoutingConfig extends Context.Tag("HttpRoutingConfig")<
	HttpRoutingConfig,
	{
		readonly config: HttpRoutingConfigInput;
	}
>() {}

export const HttpRoutingConfigLive = (config: HttpRoutingConfigInput) =>
	Layer.succeed(
		HttpRoutingConfig,
		HttpRoutingConfig.of({
			config,
		}),
	);

export type Middleware = unknown;

export const appMiddleware: Middleware = {};

export const createHttpServer = (config: HttpRoutingConfigInput, options: ResponseFactoryOptions) => {
	const httpRoutingConfigLayer = HttpRoutingConfigLive(config);
	const responseFactoryLayer = ResponseFactoryLive(options);
	
	return Layer.mergeAll(httpRoutingConfigLayer, responseFactoryLayer);
};
