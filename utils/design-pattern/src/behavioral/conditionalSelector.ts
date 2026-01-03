interface ConditionPair<T, U> {
	condition: (input: T) => boolean;
	result: U;
}

export const createSelector = <T, U>(
	conditions: ReadonlyArray<ConditionPair<T, U>>,
	defaultValue: U,
) => {
	return (input: T): U => {
		for (const pair of conditions) {
			if (pair.condition(input)) {
				return pair.result;
			}
		}
		return defaultValue;
	};
};
