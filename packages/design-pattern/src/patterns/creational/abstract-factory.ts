import { Effect } from "effect";

// Abstract Product A
export interface Button {
	readonly paint: Effect.Effect<string>;
}

// Concrete Product A1
export const createWinButton = (): Button => ({
	paint: Effect.succeed("Painting a Windows button"),
});

// Concrete Product A2
export const createMacButton = (): Button => ({
	paint: Effect.succeed("Painting a macOS button"),
});

// Abstract Product B
export interface Checkbox {
	readonly paint: Effect.Effect<string>;
}

// Concrete Product B1
export const createWinCheckbox = (): Checkbox => ({
	paint: Effect.succeed("Painting a Windows checkbox"),
});

// Concrete Product B2
export const createMacCheckbox = (): Checkbox => ({
	paint: Effect.succeed("Painting a macOS checkbox"),
});

// Abstract Factory
export interface GUIFactory {
	readonly createButton: Effect.Effect<Button>;
	readonly createCheckbox: Effect.Effect<Checkbox>;
}

// Concrete Factory 1
export const createWinFactory = (): GUIFactory => ({
	createButton: Effect.succeed(createWinButton()),
	createCheckbox: Effect.succeed(createWinCheckbox()),
});

// Concrete Factory 2
export const createMacFactory = (): GUIFactory => ({
	createButton: Effect.succeed(createMacButton()),
	createCheckbox: Effect.succeed(createMacCheckbox()),
});
