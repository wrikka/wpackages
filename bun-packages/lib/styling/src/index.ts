export { generateCss, generateCssFromContent, generateCssBundlesFromContent } from "./services/generator.service";
export { extractClasses } from "./services/generator.service";
export { generateCssVariables, parseDynamicCssVariables, generateDynamicCssVariables, resolveCssVariable } from "./services/generator/css-variables";
export { optimizeCss } from "./services/generator/css-optimizer";
export { injectCss, removeCss, generateAndInjectCss, getInjectedCss, hasInjectedCss } from "./services/runtime-css.service";
export { enableDebug, disableDebug, toggleDebug, showClassUsage } from "./services/debug.service";
export { extractCriticalCss, generateCriticalCssInline } from "./services/critical-css.service";
export { extractComponents, mergeComponentDefinitions, generateComponentCss, getComponentUsageStats } from "./services/component-extractor.service";
export { loadThemePreset, loadThemePresets, mergeThemePresets, getAvailablePresets } from "./services/theme-preset.service";

export { default as stylingPlugin } from "./plugins/vite";
export type { VitePluginOptions } from "./plugins/vite";

export type { UserOptions } from "./types/options";
export type { CssVariableOptions, CssVariableValue, DynamicCssVariable } from "./types/css-variables";
export type { ThemePreset, ThemePresetOptions } from "./types/theme-presets";
export type { TypeSafeUtilityProps, UtilityValue, UtilityProps, StyledProps, StyledComponentOptions, StyledComponentProps } from "./types/utility-props";
export type { CssOptimizerOptions, CssOptimizationResult } from "./services/generator/css-optimizer";
export type { RuntimeCssOptions } from "./services/runtime-css.service";
export type { DebugOptions } from "./services/debug.service";
export type { CriticalCssOptions, CriticalCssResult } from "./services/critical-css.service";
export type { ComponentDefinition, ComponentExtractorOptions } from "./services/component-extractor.service";

export { mergeClasses, propsToClasses, styledPropsToClasses } from "./utils/props-to-classes";

export {
	Box,
	Button,
	Card,
	Center,
	Flex,
	Grid,
	HStack,
	Input,
	Stack,
	Text,
	VStack,
	styled,
} from "./components/react";
export type { StyledComponentPropsWithChildren } from "./components/react";

export { useStyled } from "./components/vue";

export { styled as svelteStyled } from "./components/svelte";
export type { StyledActionOptions } from "./components/svelte";
