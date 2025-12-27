/**
 * Memento Pattern - Pure functional implementation
 */

export const createMemento = <T>(state: T) => ({
	getState: (): T => state,
});

export const createCaretaker = <T>() => {
	const mementos: Array<ReturnType<typeof createMemento<T>>> = [];

	return {
		save: (state: T) => {
			mementos.push(createMemento(state));
		},
		restore: (index: number): T | undefined => {
			return mementos[index]?.getState();
		},
		restoreLast: (): T | undefined => {
			return mementos[mementos.length - 1]?.getState();
		},
		count: () => mementos.length,
		clear: () => {
			mementos.length = 0;
		},
	};
};

export const createHistory = <T>(initialState: T) => {
	const states: T[] = [initialState];
	let currentIndex = 0;

	return {
		push: (state: T) => {
			states.splice(currentIndex + 1);
			states.push(state);
			currentIndex++;
		},
		undo: (): T | undefined => {
			if (currentIndex > 0) {
				currentIndex--;
				return states[currentIndex];
			}
		},
		redo: (): T | undefined => {
			if (currentIndex < states.length - 1) {
				currentIndex++;
				return states[currentIndex];
			}
		},
		current: (): T | undefined => states[currentIndex],
		canUndo: (): boolean => currentIndex > 0,
		canRedo: (): boolean => currentIndex < states.length - 1,
	};
};
