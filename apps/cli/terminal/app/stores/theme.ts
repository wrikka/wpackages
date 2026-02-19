import type { Theme } from "~/types";

const defaultThemes: Theme[] = [
	{
		id: "default-dark",
		name: "Default Dark",
		colors: {
			bg: "#0d1117",
			fg: "#c9d1d9",
			cursor: "#58a6ff",
			black: "#0d1117",
			red: "#f85149",
			green: "#238636",
			yellow: "#d29922",
			blue: "#58a6ff",
			magenta: "#bc8cff",
			cyan: "#39c5cf",
			white: "#c9d1d9",
			brightBlack: "#484f58",
			brightRed: "#ff7b72",
			brightGreen: "#3fb950",
			brightYellow: "#d29922",
			brightBlue: "#58a6ff",
			brightMagenta: "#d2a8ff",
			brightCyan: "#56d4dd",
			brightWhite: "#ffffff",
		},
	},
	{
		id: "default-light",
		name: "Default Light",
		colors: {
			bg: "#ffffff",
			fg: "#24292f",
			cursor: "#0969da",
			black: "#24292f",
			red: "#cf222e",
			green: "#1a7f37",
			yellow: "#9a6700",
			blue: "#0969da",
			magenta: "#8250df",
			cyan: "#1b7c83",
			white: "#6e7781",
			brightBlack: "#57606a",
			brightRed: "#cf222e",
			brightGreen: "#1a7f37",
			brightYellow: "#9a6700",
			brightBlue: "#0969da",
			brightMagenta: "#8250df",
			brightCyan: "#1b7c83",
			brightWhite: "#24292f",
		},
	},
];

export const useThemeStore = defineStore("theme", () => {
	const themes = ref<Theme[]>(defaultThemes);
	const activeThemeId = ref<string>("default-dark");
	const activeTheme = ref<Theme>(defaultThemes[0]);

	const setActiveTheme = (id: string) => {
		activeThemeId.value = id;
		const theme = themes.value.find((t) => t.id === id);
		if (theme) {
			activeTheme.value = theme;
			applyTheme(theme);
		}
	};

	const createTheme = (theme: Omit<Theme, "id">) => {
		const id = crypto.randomUUID();
		const newTheme: Theme = { ...theme, id };
		themes.value.push(newTheme);
	};

	const updateTheme = (id: string, updates: Partial<Theme>) => {
		const theme = themes.value.find((t) => t.id === id);
		if (theme) {
			Object.assign(theme, updates);
			if (activeThemeId.value === id) {
				activeTheme.value = theme;
				applyTheme(theme);
			}
		}
	};

	const deleteTheme = (id: string) => {
		const index = themes.value.findIndex((t) => t.id === id);
		if (index !== -1) {
			themes.value.splice(index, 1);
			if (activeThemeId.value === id) {
				setActiveTheme("default-dark");
			}
		}
	};

	const getTheme = (id: string): Theme | undefined => {
		return themes.value.find((t) => t.id === id);
	};

	const applyTheme = (theme: Theme) => {
		if (typeof document !== "undefined") {
			const root = document.documentElement;
			Object.entries(theme.colors).forEach(([key, value]) => {
				root.style.setProperty(`--terminal-${key}`, value);
			});
		}
	};

	return {
		themes,
		activeThemeId,
		activeTheme,
		setActiveTheme,
		createTheme,
		updateTheme,
		deleteTheme,
		getTheme,
		applyTheme,
	};
});
