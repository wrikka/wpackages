import { onMounted, onUnmounted, ref } from "vue";

export const useLazyLoad = (options?: IntersectionObserverInit) => {
	const observer = ref<IntersectionObserver | null>(null);
	const isIntersecting = ref(false);
	const targetRef = ref<HTMLElement | null>(null);

	const observe = () => {
		if (targetRef.value && !isIntersecting.value) {
			const defaultOptions = {
				rootMargin: `${window.innerHeight * 1.5}px 0px`,
				threshold: 0,
			};

			observer.value = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting) {
						isIntersecting.value = true;
						observer.value?.disconnect();
					}
				},
				{ ...defaultOptions, ...options },
			);

			observer.value.observe(targetRef.value);
		}
	};

	onMounted(observe);
	onUnmounted(() => observer.value?.disconnect());

	return {
		targetRef,
		isIntersecting,
	};
};
