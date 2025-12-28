import { Effect } from "effect";

// The Flyweight stores a portion of the state that can be shared.
interface TreeType {
	readonly name: string;
	readonly color: string;
	readonly draw: (x: number, y: number) => Effect.Effect<string>;
}

const createTreeType = (name: string, color: string): TreeType => ({
	name,
	color,
	draw: (x, y) => Effect.sync(() => `Drawing a ${color} ${name} tree at (${x}, ${y})`),
});

// The Flyweight Factory creates and manages flyweight objects.
export const createTreeFactory = () => {
	const treeTypes = new Map<string, TreeType>();

	return {
		getTreeType: (name: string, color: string) =>
			Effect.sync(() => {
				const key = `${name}_${color}`;
				if (!treeTypes.has(key)) {
					treeTypes.set(key, createTreeType(name, color));
				}
				return treeTypes.get(key)!;
			}),
		getTypesCount: Effect.sync(() => treeTypes.size),
	};
};
