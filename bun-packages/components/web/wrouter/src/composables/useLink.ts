import { computed, type ComputedRef } from "vue";
import { Effect } from "effect";
import { useRouter } from "./useRouter";
import { useRoute } from "./useRoute";

export interface LinkProps {
	href: string;
	isActive: boolean;
	isExactActive: boolean;
	navigate: () => Promise<void>;
}

export const useLink = (
	to: string,
): ComputedRef<LinkProps> => {
	const router = useRouter();
	const currentRoute = useRoute();

	const isActive = computed(() => {
		const currentPath = currentRoute.value?.path ?? "";
		return currentPath.startsWith(to);
	});

	const isExactActive = computed(() => {
		return currentRoute.value?.path === to;
	});

	const navigate = () => {
		return Effect.runPromise(router.push(to));
	};

	return computed(() => ({
		href: to,
		isActive: isActive.value,
		isExactActive: isExactActive.value,
		navigate,
	}));
};
