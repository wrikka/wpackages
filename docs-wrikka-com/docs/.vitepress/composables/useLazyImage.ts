import { ref, onMounted, onUnmounted, type Ref } from "vue";

interface UseLazyImageOptions {
	root?: Ref<Element | null>;
	rootMargin?: string;
	threshold?: number | number[];
}

export function useLazyImage(
	target: Ref<HTMLImageElement | null>,
	src: string,
	options: UseLazyImageOptions = {},
) {
	const isLoading = ref(true);
	const isLoaded = ref(false);
	const hasError = ref(false);

	let observer: IntersectionObserver | null = null;

	const loadImage = () => {
		if (!target.value) return;

		isLoading.value = true;
		hasError.value = false;

		const img = new Image();
		img.src = src;

		img.onload = () => {
			if (target.value) {
				target.value.src = src;
			}
			isLoading.value = false;
			isLoaded.value = true;
		};

		img.onerror = () => {
			isLoading.value = false;
			hasError.value = true;
		};
	};

	const onIntersect = (
		entries: IntersectionObserverEntry[],
		observer: IntersectionObserver,
	) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				loadImage();
				observer.unobserve(entry.target);
			}
		});
	};

	onMounted(() => {
		if (target.value) {
			observer = new IntersectionObserver(onIntersect, {
				root: options.root?.value,
				rootMargin: options.rootMargin || "0px",
				threshold: options.threshold || 0.1,
			});
			observer.observe(target.value);
		}
	});

	onUnmounted(() => {
		if (observer && target.value) {
			observer.unobserve(target.value);
		}
	});

	return {
		isLoading,
		isLoaded,
		hasError,
	};
}
