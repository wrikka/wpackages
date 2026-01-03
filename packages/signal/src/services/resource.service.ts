import type { Resource, ResourceActions } from "../types";
import { createSignal } from "../utils/signal.util";
import { createEffect } from "./effect.scope";

export function createResource<T>(
	source: () => Promise<T> | T,
	initialValue?: T,
): Resource<T> {
	const [data, setData] = createSignal<T | undefined>(initialValue);
	const [loading, setLoading] = createSignal(false);
	const [error, setError] = createSignal<unknown | undefined>(undefined);

	const fetcher = async () => {
		setLoading(true);
		setError(undefined);
		try {
			const result = await source();
			setData(result);
			return result;
		} catch (e) {
			setError(e);
		} finally {
			setLoading(false);
		}
	};

	createEffect(fetcher);

	const actions: ResourceActions<T> = {
		loading,
		error,
		refetch: fetcher,
	};

	return [data, actions] as Resource<T>;
}
