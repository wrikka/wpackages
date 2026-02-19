import { inject, type InjectionKey, provide } from "vue";
import type { Router } from "../client/router";
import type { WRouteRecord } from "../types";

export const RouterKey: InjectionKey<Router<any>> = Symbol("wrouter");

export const provideRouter = <TRoutes extends readonly WRouteRecord<any, any>[]>(
	router: Router<TRoutes>,
) => {
	provide(RouterKey, router);
};

export const useRouter = <
	TRoutes extends readonly WRouteRecord<any, any>[],
>(): Router<TRoutes> => {
	const router = inject(RouterKey);
	if (!router) {
		throw new Error("useRouter() called outside of a router context.");
	}
	return router as Router<TRoutes>;
};
