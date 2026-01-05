import { deepmerge } from "deepmerge-ts";
import React, { createContext, useContext, useMemo } from "react";
import { defaultTheme, type PromptTheme } from "../constant/theme";

export const ThemeContext = createContext<PromptTheme>(defaultTheme);

export const useTheme = () => {
	const context = useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return context;
};

interface ThemeProviderProps {
	theme?: Partial<PromptTheme> | undefined;
	children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ theme, children }) => {
	const mergedTheme = useMemo(() => {
		return theme ? deepmerge(defaultTheme, theme) : defaultTheme;
	}, [theme]);

	return (
		<ThemeContext.Provider value={mergedTheme}>
			{children}
		</ThemeContext.Provider>
	);
};
