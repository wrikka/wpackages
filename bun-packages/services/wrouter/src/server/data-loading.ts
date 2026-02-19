import { Effect } from "effect";
import type { RouteDataLoader, RouteDataLoadResult } from "../types";

export const createDataLoader = <T>(
	load: (params: Readonly<Record<string, string | number | boolean>>) => Effect.Effect<RouteDataLoadResult<T>, Error>,
): RouteDataLoader<T> => Object.freeze({ load });

export const fetchData = async <T>(
	loader: RouteDataLoader<T>,
	params: Readonly<Record<string, string | number | boolean>>,
): Promise<RouteDataLoadResult<T>> => {
	return Effect.runPromise(loader.load(params));
};

export const jsonLoader = <T>(url: string): RouteDataLoader<T> =>
	createDataLoader(() =>
		Effect.tryPromise({
			try: () => fetch(url).then((res) => res.json()) as Promise<T>,
			catch: (error) => new Error(`Failed to fetch data: ${error}`),
		}).pipe(Effect.map((data) => ({ data }))),
	);
