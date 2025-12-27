/**
 * Layer and Group types - Pure functional layer management
 */

/**
 * Layer - contains multiple shapes
 */
export interface Layer {
	readonly id: string;
	readonly name: string;
	readonly shapes: readonly string[]; // Shape IDs
	readonly visible: boolean;
	readonly locked: boolean;
	readonly opacity: number; // 0-1
	readonly blendMode: BlendMode;
	readonly zIndex: number;
}

/**
 * Group - hierarchical grouping of shapes
 */
export interface Group {
	readonly id: string;
	readonly name: string;
	readonly children: readonly string[]; // Shape or Group IDs
	readonly visible: boolean;
	readonly locked: boolean;
	readonly opacity: number;
	readonly transform?: {
		readonly x: number;
		readonly y: number;
		readonly rotation: number;
		readonly scaleX: number;
		readonly scaleY: number;
	};
}

/**
 * Blend modes for layers
 */
export type BlendMode =
	| "normal"
	| "multiply"
	| "screen"
	| "overlay"
	| "darken"
	| "lighten"
	| "color-dodge"
	| "color-burn"
	| "hard-light"
	| "soft-light"
	| "difference"
	| "exclusion"
	| "hue"
	| "saturation"
	| "color"
	| "luminosity";

// ===== Layer Factory Functions =====

/**
 * Create layer - pure function
 */
export const createLayer = (config: {
	id: string;
	name: string;
	shapes?: readonly string[];
	visible?: boolean;
	locked?: boolean;
	opacity?: number;
	blendMode?: BlendMode;
	zIndex?: number;
}): Layer => ({
	blendMode: config.blendMode ?? "normal",
	id: config.id,
	locked: config.locked ?? false,
	name: config.name,
	opacity: config.opacity ?? 1,
	shapes: config.shapes ?? [],
	visible: config.visible ?? true,
	zIndex: config.zIndex ?? 0,
});

/**
 * Create group - pure function
 */
export const createGroup = (config: {
	id: string;
	name: string;
	children?: readonly string[];
	visible?: boolean;
	locked?: boolean;
	opacity?: number;
	transform?: {
		x?: number;
		y?: number;
		rotation?: number;
		scaleX?: number;
		scaleY?: number;
	};
}): Group => {
	const base = {
		children: config.children ?? [],
		id: config.id,
		locked: config.locked ?? false,
		name: config.name,
		opacity: config.opacity ?? 1,
		visible: config.visible ?? true,
	};

	if (config.transform) {
		return {
			...base,
			transform: {
				rotation: config.transform.rotation ?? 0,
				scaleX: config.transform.scaleX ?? 1,
				scaleY: config.transform.scaleY ?? 1,
				x: config.transform.x ?? 0,
				y: config.transform.y ?? 0,
			},
		};
	}

	return base;
};

// ===== Layer Operations =====

/**
 * Add shape to layer - pure function
 */
export const addShapeToLayer = (layer: Layer, shapeId: string): Layer => ({
	...layer,
	shapes: [...layer.shapes, shapeId],
});

/**
 * Remove shape from layer - pure function
 */
export const removeShapeFromLayer = (layer: Layer, shapeId: string): Layer => ({
	...layer,
	shapes: layer.shapes.filter((id) => id !== shapeId),
});

/**
 * Move shape between layers - pure function
 */
export const moveShapeBetweenLayers = (
	sourceLayer: Layer,
	targetLayer: Layer,
	shapeId: string,
): { source: Layer; target: Layer } => ({
	source: removeShapeFromLayer(sourceLayer, shapeId),
	target: addShapeToLayer(targetLayer, shapeId),
});

/**
 * Toggle layer visibility - pure function
 */
export const toggleLayerVisibility = (layer: Layer): Layer => ({
	...layer,
	visible: !layer.visible,
});

/**
 * Set layer opacity - pure function
 */
export const setLayerOpacity = (layer: Layer, opacity: number): Layer => ({
	...layer,
	opacity: Math.max(0, Math.min(1, opacity)),
});

/**
 * Set layer blend mode - pure function
 */
export const setLayerBlendMode = (
	layer: Layer,
	blendMode: BlendMode,
): Layer => ({
	...layer,
	blendMode,
});

/**
 * Reorder layer - pure function
 */
export const setLayerZIndex = (layer: Layer, zIndex: number): Layer => ({
	...layer,
	zIndex,
});

// ===== Group Operations =====

/**
 * Add child to group - pure function
 */
export const addChildToGroup = (group: Group, childId: string): Group => ({
	...group,
	children: [...group.children, childId],
});

/**
 * Remove child from group - pure function
 */
export const removeChildFromGroup = (group: Group, childId: string): Group => ({
	...group,
	children: group.children.filter((id) => id !== childId),
});

/**
 * Toggle group visibility - pure function
 */
export const toggleGroupVisibility = (group: Group): Group => ({
	...group,
	visible: !group.visible,
});

/**
 * Set group transform - pure function
 */
export const setGroupTransform = (
	group: Group,
	transform: Partial<NonNullable<Group["transform"]>>,
): Group => ({
	...group,
	transform: {
		rotation: transform.rotation ?? group.transform?.rotation ?? 0,
		scaleX: transform.scaleX ?? group.transform?.scaleX ?? 1,
		scaleY: transform.scaleY ?? group.transform?.scaleY ?? 1,
		x: transform.x ?? group.transform?.x ?? 0,
		y: transform.y ?? group.transform?.y ?? 0,
	},
});

/**
 * Flatten group to shapes - pure function
 */
export const flattenGroup = (group: Group): readonly string[] => {
	return group.children;
};

// ===== Layer Management =====

/**
 * Sort layers by z-index - pure function
 */
export const sortLayersByZIndex = (
	layers: readonly Layer[],
): readonly Layer[] => {
	return [...layers].sort((a, b) => a.zIndex - b.zIndex);
};

/**
 * Get visible layers - pure function
 */
export const getVisibleLayers = (
	layers: readonly Layer[],
): readonly Layer[] => {
	return layers.filter((layer) => layer.visible);
};

/**
 * Get unlocked layers - pure function
 */
export const getUnlockedLayers = (
	layers: readonly Layer[],
): readonly Layer[] => {
	return layers.filter((layer) => !layer.locked);
};

/**
 * Find layer by shape ID - pure function
 */
export const findLayerByShapeId = (
	layers: readonly Layer[],
	shapeId: string,
): Layer | undefined => {
	return layers.find((layer) => layer.shapes.includes(shapeId));
};

/**
 * Merge layers - pure function
 */
export const mergeLayers = (layers: readonly Layer[], name: string): Layer => {
	const mergedShapes = layers.flatMap((layer) => layer.shapes);
	const maxZIndex = Math.max(...layers.map((l) => l.zIndex), 0);

	return createLayer({
		id: `merged-${Date.now()}`,
		name,
		shapes: mergedShapes,
		zIndex: maxZIndex,
	});
};

/**
 * Duplicate layer - pure function
 */
export const duplicateLayer = (layer: Layer): Layer => ({
	...layer,
	id: `${layer.id}-copy-${Date.now()}`,
	name: `${layer.name} (Copy)`,
	zIndex: layer.zIndex + 1,
});

// ===== Blend Mode Application =====

/**
 * Get canvas global composite operation for blend mode
 */
export const getCompositeOperation = (
	blendMode: BlendMode,
): GlobalCompositeOperation => {
	const map: Record<BlendMode, GlobalCompositeOperation> = {
		color: "color",
		"color-burn": "color-burn",
		"color-dodge": "color-dodge",
		darken: "darken",
		difference: "difference",
		exclusion: "exclusion",
		"hard-light": "hard-light",
		hue: "hue",
		lighten: "lighten",
		luminosity: "luminosity",
		multiply: "multiply",
		normal: "source-over",
		overlay: "overlay",
		saturation: "saturation",
		screen: "screen",
		"soft-light": "soft-light",
	};
	return map[blendMode];
};
