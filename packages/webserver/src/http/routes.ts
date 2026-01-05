import { HttpRouter } from "@effect/platform";
import { benchParamRoute, benchRootRoute } from "./routes/bench";
import { docsRoute } from "./routes/docs";
import { healthz, readyz } from "./routes/health";
import { openapiRoute } from "./routes/openapi";
import { userRoute } from "./routes/user";

export const appRoutes = HttpRouter.empty.pipe(
	benchRootRoute,
	benchParamRoute,
	healthz,
	readyz,
	userRoute,
	docsRoute,
	openapiRoute,
);
