/**
 * The type of action that triggers a location change.
 */
export const Action = {
	Pop: "POP",
	Push: "PUSH",
	Replace: "REPLACE",
} as const;

/**
 * The type of action that triggers a location change.
 */
export type Action = typeof Action[keyof typeof Action];

/**
 * An object that represents a location in the history stack.
 */
export interface Location {
	pathname: string;
	search: string;
	hash: string;
	state: unknown;
	key: string;
}

/**
 * A function that receives notifications about location changes.
 */
export type Listener = (location: Location, action: Action) => void;

/**
 * A history object that provides a minimal API for managing session history.
 */
/**
 * A source of history events, providing the core navigation logic.
 */
export interface HistorySource {
	readonly location: Location;
	readonly action: Action;
	push(path: string, state?: unknown): void;
	replace(path: string, state?: unknown): void;
	go(delta: number): void;
	listen(listener: (location: Location, action: Action) => void): () => void;
}

/**
 * A history object that provides a minimal API for managing session history.
 */
export interface History {
	readonly index?: number;
	readonly location: Location;
	readonly action: Action;
	push(path: string, state?: unknown): void;
	replace(path: string, state?: unknown): void;
	go(delta: number): void;
	back(): void;
	forward(): void;
	listen(listener: Listener): () => void;
}
