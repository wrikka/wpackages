import { HttpServer } from "@effect/platform";
import { BunHttpServer } from "@effect/platform-bun";
import { DatabaseLive } from "@wpackages/database";
import { ResponseFactoryLive } from "@wpackages/http";
import { appMiddleware, HttpRoutingConfigLive } from "@wpackages/http-routing";
import { Effect, Layer } from "effect";
import { ConfigLive } from "./config/config";
import { getDatabaseUrl, isTestMode, loadEnv } from "./config/env";
import { appRoutes } from "./http/routes";
import { type User, UserNotFoundError, UserService, UserServiceLive } from "./services/user.service";

const UserServiceInMemory = Layer.succeed(
	UserService,
	UserService.of({
		getUser: (id: number) => {
			if (id === 1) {
				const user: User = { id: 1, name: "John Doe" };
				return Effect.succeed(user);
			}
			return Effect.fail(new UserNotFoundError({ id }));
		},
	}),
);

export const main = Layer.unwrapEffect(
	Effect.sync(() => {
		const env = loadEnv();
		const dbUrl = getDatabaseUrl(env);

		const responseFactoryLayer = ResponseFactoryLive({
			withSecurityHeaders: env.ENABLE_SECURITY_HEADERS,
		});
		const httpRoutingConfigLayer = HttpRoutingConfigLive(env);
		const serverLayer = BunHttpServer.layer({ port: env.PORT });
		const databaseLayer = dbUrl ? DatabaseLive(dbUrl) : Layer.empty;
		const userLayer = isTestMode(env) || !dbUrl ? UserServiceInMemory : UserServiceLive;

		const runtimeLayer = Layer.mergeAll(
			ConfigLive,
			httpRoutingConfigLayer,
			responseFactoryLayer,
			databaseLayer,
			userLayer,
			serverLayer,
		);

		const middleware = appMiddleware;

		const router = appRoutes;
		const app = router.pipe(
			HttpServer.serve(middleware),
			HttpServer.withLogAddress,
		);

		return Layer.provide(app, runtimeLayer);
	}),
);
