import type { ConfigLayer } from "../types/config";

/**
 * Merge configuration layers into single config
 * Pure function - no side effects
 */
export const mergeConfigLayers = <T extends Record<string, unknown>>(
	layers: ConfigLayer<T>[],
): T => {
	return layers.reduce((acc, layer) => {
		return { ...acc, ...layer.config };
	}, {} as T);
};

/**
 * Get layer by source
 * Pure function - no side effects
 */
export const getLayerBySource = <T extends Record<string, unknown>>(
	layers: ConfigLayer<T>[],
	source: string,
): ConfigLayer<T> | undefined => {
	return layers.find((layer) => layer.source === source);
};

/**
 * Get layers by source type
 * Pure function - no side effects
 */
export const getLayersBySourceType = <T extends Record<string, unknown>>(
	layers: ConfigLayer<T>[],
	sourceType: ConfigLayer<T>["sourceType"],
): ConfigLayer<T>[] => {
	return layers.filter((layer) => layer.sourceType === sourceType);
};

/**
 * Get layer sources
 * Pure function - no side effects
 */
export const getLayerSources = <T extends Record<string, unknown>>(
	layers: ConfigLayer<T>[],
): string[] => {
	return layers.map((layer) => layer.source);
};
