/**
 * Template Method Pattern - Pure functional implementation
 */

export const createTemplate = <TContext, TResult>(
	steps: ReadonlyArray<(context: TContext) => TContext>,
	finalize: (context: TContext) => TResult,
) => {
	return (initialContext: TContext): TResult => {
		const finalContext = steps.reduce(
			(context, step) => step(context),
			initialContext,
		);
		return finalize(finalContext);
	};
};

export const createPipeline = <T>(
	...steps: ReadonlyArray<(value: T) => T>
) => {
	return (initialValue: T): T => {
		return steps.reduce((value, step) => step(value), initialValue);
	};
};

export const createAsyncTemplate = <TContext, TResult>(
	steps: ReadonlyArray<(context: TContext) => Promise<TContext>>,
	finalize: (context: TContext) => TResult | Promise<TResult>,
) => {
	return async (initialContext: TContext): Promise<TResult> => {
		let context = initialContext;
		for (const step of steps) {
			context = await step(context);
		}
		return finalize(context);
	};
};
