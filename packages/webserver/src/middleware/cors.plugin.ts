import type { Plugin } from "../lib/core";

export interface CorsPluginOptions {
	origin?: string | string[] | RegExp;
	methods?: string[];
	allowedHeaders?: string[];
}

export const corsPlugin = (options: CorsPluginOptions = {}): Plugin => {
	const {
		origin = "*",
		methods = ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders = [],
	} = options;

	const corsHeaders = {
		"Access-Control-Allow-Origin": Array.isArray(origin)
			? origin.join(", ")
			: origin.toString(),
		"Access-Control-Allow-Methods": methods.join(", "),
		"Access-Control-Allow-Headers": allowedHeaders.join(", "),
	};

	return {
		name: "cors",
		setup: (app) => {
			app.beforeHandle(({ req }) => {
				// Handle pre-flight OPTIONS request
				if (req.method === "OPTIONS") {
					return new Response(null, { status: 204, headers: corsHeaders });
				}

				// For non-pre-flight requests, we'll add headers in the afterHandle hook
			});

			app.afterHandle((_ctx, response) => {
				// Clone the response to make it mutable
				const newResponse = new Response(response.body, response);

				// Add CORS headers
				for (const [key, value] of Object.entries(corsHeaders)) {
					newResponse.headers.set(key, value);
				}

				return newResponse;
			});
		},
	};
};
