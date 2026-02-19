import { computed, type ComputedRef, onUnmounted, ref } from "vue";
import type { RouteMatch, WRouteRecord } from "../types";
import { useRouter } from "./useRouter";

export const useRoute = <
	TRoutes extends readonly WRouteRecord<any, any>[],
>(): ComputedRef<RouteMatch<TRoutes[number]> | null> => {
	const router = useRouter<TRoutes>();
	const match = ref(router.state.match);

	const unsubscribe = router.listen((newState) => {
		match.value = newState.match;
	});

	onUnmounted(() => {
		unsubscribe();
	});

	return computed(() => match.value);
};
