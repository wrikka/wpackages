import { ref, computed } from "vue";

export function useUnoCSSTheme() {
	const colors = ref({
		text: "var(--vp-c-text-1)",
		background: "var(--vp-c-bg-soft)",
		indigo: "var(--vp-c-indigo-1)",
		purple: "var(--vp-c-purple-1)",
		yellow: "var(--vp-c-yellow-1)",
		red: "var(--vp-c-red-1)",
		green: "var(--vp-c-green-1)",
	});

	return {
		colors,
		getColor: computed(
			() => (color: keyof typeof colors.value) => colors.value[color],
		),
	};
}

export type UnoCSSTheme = ReturnType<typeof useUnoCSSTheme>;
