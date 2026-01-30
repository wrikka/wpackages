import { reactive, readonly, toRefs } from "vue";
import { Mutation } from "../mutation";
import type { MutationOptions, MutationState } from "../types";
import { useQueryClient } from "./QueryClientProvider";

export function useMutation<TData, TVariables, TError, TContext>(
	mutator: (variables: TVariables) => Promise<TData>,
	options: MutationOptions<TData, TVariables, TError, TContext> = {},
) {
	const client = useQueryClient();
	const mutation = new Mutation<TData, TVariables, TError, TContext>(client, mutator, options);
	const state = reactive<MutationState<TData, TError>>(mutation.current);

	const mutate = (variables: TVariables) => {
		const promise = mutation.mutate(variables);
		Object.assign(state, mutation.current); // Sync state immediately

		promise
			.then(() => {
				Object.assign(state, mutation.current);
			})
			.catch(() => {
				Object.assign(state, mutation.current);
			});

		return promise;
	};

	const reset = () => {
		mutation.reset();
		Object.assign(state, mutation.current);
	};

	return {
		...toRefs(readonly(state)),
		mutate,
		reset,
	};
}
