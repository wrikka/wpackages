import { computed, type ComputedRef } from "vue";
import { Effect } from "effect";
import { createRouterComposable } from "./use-router.component";
import { useRoute } from "./use-route.component";

export interface LinkProps {
	href: string;
	isActive: boolean;
	isExactActive: boolean;
	navigate: () => Promise<void>;
}

export const useLink = (
	to: string,
): ComputedRef<LinkProps> => {
	const routerComposable = createRouterComposable();
	const currentRoute = useRoute();

	const isActive = computed(() => {
		const currentPath = currentRoute.value?.route?.path ?? "";
		return currentPath.startsWith(to);
	});

	const isExactActive = computed(() => {
		return currentRoute.value?.route?.path === to;
	});

	const navigate = (): Promise<void> => {
		const router = routerComposable.getRouter();
		if (!router) return Promise.reject(new Error("Router not available"));
		return Effect.runPromise(router.push(to));
	};

	return computed(() => ({
		href: to,
		isActive: isActive.value,
		isExactActive: isExactActive.value,
		navigate,
	}));
};
