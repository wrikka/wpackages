import { ref, onMounted, onUnmounted, type Ref, watch } from "vue";
import { debounce } from "lodash-es";

interface UseInfiniteScrollOptions {
	root?: Ref<Element | null>;
	rootMargin?: string;
	threshold?: number;
	debounceMs?: number;
}

export function useInfiniteScroll(
	target: Ref<HTMLElement | null>,
	onLoadMore: () => Promise<void>,
	options: UseInfiniteScrollOptions & { hasMore: Ref<boolean> },
) {
	const isLoading = ref(false);
	const hasError = ref(false);

	const { rootMargin = "500px", threshold = 0.1, debounceMs = 50 } = options;

	const debouncedLoadMore = debounce(onLoadMore, debounceMs);

	let observer: IntersectionObserver | null = null;

	const handleLoadMore = async () => {
		if (isLoading.value || !options.hasMore.value) return;

		isLoading.value = true;
		hasError.value = false;
		try {
			await debouncedLoadMore();
		} catch (e) {
			hasError.value = true;
			console.error("Failed to load more items", e);
		} finally {
			isLoading.value = false;
		}
	};

	const observeTarget = () => {
		if (target.value) {
			observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting && options.hasMore.value) {
							handleLoadMore();
						}
					});
				},
				{
					root: options.root?.value,
					rootMargin,
					threshold,
				},
			);
			observer.observe(target.value);
		}
	};

	const unobserveTarget = () => {
		if (observer && target.value) {
			observer.unobserve(target.value);
			observer = null;
		}
	};

	onMounted(() => {
		watch(
			[target, options.hasMore],
			([newTarget, newHasMore]) => {
				unobserveTarget();
				if (newTarget && newHasMore) {
					observeTarget();
				}
			},
			{ immediate: true, flush: "post" },
		);
	});

	onUnmounted(() => {
		unobserveTarget();
		observer?.disconnect();
	});

	return {
		isLoading,
		hasError,
	};
}
