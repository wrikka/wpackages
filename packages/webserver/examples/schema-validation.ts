import { email, number, object, string } from "@wpackages/schema";

import { createWebServer } from "../src/lib";

const app = createWebServer({ port: 3004, host: "localhost" });

app.route({
	method: "POST",
	path: "/api/users",
	schema: {
		body: object({
			name: string(),
			email: email(),
		}),
		response: object({
			id: number(),
			name: string(),
			email: string(),
		}),
	},
	handler: async (request) => {
		const body = await request.json();
		return { id: 1, ...body };
	},
});

app.start().catch((error) => {
	console.error("Failed to start server:", error);
	process.exit(1);
});
