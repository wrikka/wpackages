import { HttpServerResponse } from "@effect/platform";
import { Context, Layer } from "effect";

const defaultSecurityHeaders = {
	"x-content-type-options": "nosniff",
	"x-frame-options": "DENY",
	"referrer-policy": "no-referrer",
	"x-dns-prefetch-control": "off",
	"cross-origin-opener-policy": "same-origin",
	"cross-origin-resource-policy": "same-origin",
	"permissions-policy": "camera=(), microphone=(), geolocation=()",
} as const;

type HeadersInitLike = Readonly<Record<string, string>>;

type ResponseOptions = {
	readonly status?: number;
	readonly headers?: HeadersInitLike;
};

export interface ResponseFactoryConfig {
	readonly withSecurityHeaders: boolean;
}

export class ResponseFactory {
	static readonly Current = Context.GenericTag<ResponseFactory>("ResponseFactory");

	constructor(private readonly config: ResponseFactoryConfig) {}

	private mergeHeaders(headers: HeadersInitLike | undefined): HeadersInitLike {
		if (!this.config.withSecurityHeaders) {
			return headers ?? {};
		}
		return { ...defaultSecurityHeaders, ...headers };
	}

	text(body: string, options?: ResponseOptions) {
		return HttpServerResponse.text(body, {
			...options,
			headers: this.mergeHeaders(options?.headers),
		});
	}

	html(body: string, options?: ResponseOptions) {
		return HttpServerResponse.text(body, {
			...options,
			headers: this.mergeHeaders({
				"content-type": "text/html; charset=utf-8",
				...options?.headers,
			}),
		});
	}

	json(value: unknown, options?: ResponseOptions) {
		return HttpServerResponse.json(value, {
			...options,
			headers: this.mergeHeaders(options?.headers),
		});
	}
}

export const ResponseFactoryLive = (config: ResponseFactoryConfig) =>
	Layer.succeed(ResponseFactory.Current, new ResponseFactory(config));
