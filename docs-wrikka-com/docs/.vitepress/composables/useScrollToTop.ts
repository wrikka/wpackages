import { ref, onMounted, onUnmounted } from "vue";

export default function useScrollToTop() {
	const showScrollToTop = ref(false);

	const handleScroll = () => {
		showScrollToTop.value = window.scrollY > 300;
	};

	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	onMounted(() => {
		window.addEventListener("scroll", handleScroll);
	});

	onUnmounted(() => {
		window.removeEventListener("scroll", handleScroll);
	});

	return {
		showScrollToTop,
		scrollToTop,
	};
}
