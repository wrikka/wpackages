export type Listener<T> = (data: T) => void;

export type StrategyFunction<T, R> = (input: T) => R;

export type StrategyMap<T, R> = Record<string, StrategyFunction<T, R>>;

export type CommandExecute<T> = () => T;

export type CommandUndo = () => void;

export interface Command<T> {
	execute: CommandExecute<T>;
	undo: CommandUndo;
}

export type StateValue<T extends Record<string, any>> = T;

export type PartialState<T extends Record<string, any>> = Partial<T>;

export interface StateManager<T extends Record<string, any>> {
	getState: () => StateValue<T>;
	setState: (newState: PartialState<T>) => void;
}
