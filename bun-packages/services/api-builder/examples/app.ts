import * as Schema from "@effect/schema/Schema";
import { Effect } from "effect";
import { builder, createServer } from "../src";

const User = Schema.Struct({
	id: Schema.Number,
	name: Schema.String,
});

export const api = builder()
	.post("getUser", "/getUser", {
		schema: {
			response: User,
		},
		handler: () => Effect.succeed({ id: 1, name: "John Doe" }),
	})
	.build();

// Export the type of the API for the client
export type ApiType = typeof api;

// Create and start the server
if (import.meta.main) {
	createServer(api);
	console.log("Server running at http://localhost:3000");
}
