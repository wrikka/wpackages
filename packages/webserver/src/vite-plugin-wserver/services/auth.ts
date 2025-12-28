import { defineEventHandler, getHeader, setResponseStatus } from "h3";
import { jwtVerify } from "jose";
import type { WServerOptions } from "../types";

export function createAuthMiddleware(options: WServerOptions) {
	return defineEventHandler(async (event) => {
		if (!options.auth || !options.auth.jwt?.secret || !event.node) return;

		const secret = new TextEncoder().encode(options.auth.jwt.secret);

		// Example of a protected route
		if (event.node.req.url?.startsWith("/api/protected")) {
			const token = getHeader(event, "authorization")?.split(" ")[1];
			if (!token) {
				setResponseStatus(event, 401);
				return "Unauthorized";
			}
			try {
				await jwtVerify(token, secret);
			} catch {
				setResponseStatus(event, 401);
				return "Invalid token";
			}
		}
	});
}
