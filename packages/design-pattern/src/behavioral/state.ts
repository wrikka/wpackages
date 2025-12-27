/**
 * State Pattern - Pure functional implementation
 */

import type { State } from "../types";

export const createStateMachine = <TContext, TState extends string, TResult>(
	initialState: TState,
	states: Record<TState, State<TContext, TResult>>,
) => {
	let currentState = initialState;

	return {
		handle: (context: TContext): TResult => {
			return states[currentState].handle(context);
		},
		transition: (newState: TState) => {
			currentState = newState;
		},
		getCurrentState: () => currentState,
	};
};

export const createReducer = <TState, TAction>(
	initialState: TState,
	handlers: Record<string, (state: TState, action: TAction) => TState>,
) => {
	return (state: TState = initialState, action: TAction & { type: string }): TState => {
		const handler = handlers[action.type];
		return handler ? handler(state, action) : state;
	};
};
