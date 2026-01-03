import { Effect, Layer } from "effect";
import { z } from "zod";
import { DatabaseLive } from "./db/database.service";
import { HttpError } from "./error";
import { WServer } from "./lib/core";
import { corsPlugin } from "./middleware/cors.plugin";
import { loggerPlugin } from "./middleware/logger.plugin";
import { staticPlugin } from "./middleware/static.plugin";
import { UserService, UserServiceLive } from "./services/user.service";
import { createPostSchema } from "./types/post";
import { text } from "./utils/response";

export function createApp() {
	const app = new WServer();

	// Register plugins
	app.use(loggerPlugin);
	app.use(corsPlugin());
	app.use(staticPlugin());

	// Define routes
	app
		.get("/", () => Effect.succeed(text("Hello from /index")))
		.get("/hello", () => Effect.succeed({ message: "Hello from /hello" }))
		.get(
			"/users/:id",
			({ params }) =>
				UserService.pipe(
					Effect.flatMap((userService) => userService.getUserById(Number(params.id))),
					Effect.map((user) => ({ user })),
					Effect.catchTag(
						"UserNotFoundError",
						(err) => Effect.fail(new HttpError(404, `User ${err.userId} not found`)),
					),
				),
			{
				params: z.object({ id: z.string() }),
				response: z.object({
					user: z.object({ id: z.number(), name: z.string() }),
				}),
			},
		)
		.post(
			"/posts",
			({ body }) => {
				const newPost = { id: Date.now(), ...body };
				return Effect.succeed(
					new Response(JSON.stringify(newPost), { status: 201 }),
				);
			},
			{ body: createPostSchema },
		);

	// Define the application's dependency layer
	const AppLayer = UserServiceLive.pipe(Layer.provide(DatabaseLive));

	// Provide the layer to the server
	app.setEffectLayer(AppLayer);

	return app;
}
