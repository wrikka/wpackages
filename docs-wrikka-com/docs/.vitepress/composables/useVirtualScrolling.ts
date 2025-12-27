import { ref, computed, onMounted, onUnmounted } from "vue";

export default function useVirtualScrolling<T>(
	items: T[],
	itemHeight: number,
	buffer = 5,
) {
	const containerRef = ref<HTMLElement | null>(null);
	const scrollTop = ref(0);
	const containerHeight = ref(0);

	const visibleCount = computed(
		() => Math.ceil(containerHeight.value / itemHeight) + buffer * 2,
	);

	const startIndex = computed(() =>
		Math.max(0, Math.floor(scrollTop.value / itemHeight) - buffer),
	);

	const endIndex = computed(() =>
		Math.min(items.length, startIndex.value + visibleCount.value),
	);

	const visibleItems = computed(() =>
		items.slice(startIndex.value, endIndex.value),
	);

	const totalHeight = computed(() => items.length * itemHeight);
	const offset = computed(() => startIndex.value * itemHeight);

	const handleScroll = () => {
		scrollTop.value = containerRef.value?.scrollTop || 0;
	};

	onMounted(() => {
		if (!containerRef.value) return;

		containerHeight.value = containerRef.value.clientHeight;
		const resizeObserver = new ResizeObserver(() => {
			containerHeight.value = containerRef.value?.clientHeight || 0;
		});

		resizeObserver.observe(containerRef.value);
		containerRef.value.addEventListener("scroll", handleScroll, {
			passive: true,
		});

		onUnmounted(() => {
			resizeObserver.disconnect();
			containerRef.value?.removeEventListener("scroll", handleScroll);
		});
	});

	return {
		containerRef,
		visibleItems,
		totalHeight,
		offset,
	};
}
