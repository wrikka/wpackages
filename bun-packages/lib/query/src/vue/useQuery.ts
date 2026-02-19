import { onUnmounted, reactive, readonly, toRefs, watch } from "vue";
import { QueryObserver } from "../observer";
import type { DataLoader, QueryKey, QueryOptions, QueryState } from "../types";
import { useQueryClient } from "./QueryClientProvider";

export function useQuery<T>(
	key: QueryKey,
	fetcher: DataLoader<T>,
	options: QueryOptions<T> = {},
) {
	const queryClient = useQueryClient();
	let observer = new QueryObserver<T>(queryClient, key, fetcher, options);

	const state = reactive<QueryState<T>>(observer.current);

	let unsubscribe = observer.subscribe((newState) => {
		Object.assign(state, newState);
	});

	watch([key, options], () => {
		unsubscribe();
		observer = new QueryObserver<T>(queryClient, key, fetcher, options);
		unsubscribe = observer.subscribe((newState) => {
			Object.assign(state, newState);
		});
	}, { deep: true });

	onUnmounted(() => {
		unsubscribe();
	});

	return {
		...toRefs(readonly(state)),
		refetch: () => observer.refetch(),
		invalidate: () => observer.invalidate(),
		setData: (data: T) => observer.setData(data),
	};
}
