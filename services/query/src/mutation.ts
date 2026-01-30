import type { QueryClient } from "./client";
import type { MutationOptions, MutationState } from "./types";

export class Mutation<TData = unknown, TVariables = void, TError = unknown, TContext = unknown> {
	private state: MutationState<TData, TError>;
	private options: MutationOptions<TData, TVariables, TError, TContext>;

	constructor(
		private client: QueryClient,
		private mutator: (variables: TVariables) => Promise<TData>,
		options: MutationOptions<TData, TVariables, TError, TContext> = {},
	) {
		this.options = options;
		this.state = {
			data: undefined,
			error: undefined,
			isLoading: false,
			isError: false,
			isSuccess: false,
			isIdle: true,
			status: "idle",
			variables: undefined,
		};
	}

	get current(): MutationState<TData, TError> {
		return { ...this.state };
	}

	async mutate(variables: TVariables): Promise<TData> {
		let context: TContext | undefined;
		this.state = {
			data: undefined,
			error: undefined,
			isLoading: true,
			isError: false,
			isSuccess: false,
			isIdle: false,
			status: "loading",
			variables,
		};

		let attempt = 0;
		const maxAttempts = (this.options.retry ?? 0) + 1;
		let lastError: TError | undefined;

		try {
			context = await this.options.onMutate?.(variables);
		} catch (error) {
			// onMutate error is considered an immediate failure
			this.options.onError?.(error as TError, variables, context);
			this.options.onSettled?.(undefined, error as TError, variables, context);
			throw error;
		}

		while (attempt < maxAttempts) {
			try {
				const data = await this.mutator(variables);

				this.state = {
					data,
					error: undefined,
					isLoading: false,
					isError: false,
					isSuccess: true,
					isIdle: false,
					status: "success",
					variables,
				};

				this.options.onSuccess?.(data, variables, context as TContext);
				this.options.onSettled?.(data, undefined, variables, context);

				if (this.options.invalidateQueries) {
					this.options.invalidateQueries.forEach((key) => {
						this.client.invalidateQueries(key);
					});
				}

				return data;
			} catch (error) {
				lastError = error as TError;
				attempt++;

				if (attempt < maxAttempts) {
					const delay = typeof this.options.retryDelay === "function"
						? this.options.retryDelay(attempt)
						: (this.options.retryDelay ?? 1000);

					await this.sleep(delay);
				}
			}
		}

		this.state = {
			data: undefined,
			error: lastError,
			isLoading: false,
			isError: true,
			isSuccess: false,
			isIdle: false,
			status: "error",
			variables,
		};

		this.options.onError?.(lastError!, variables, context);
		this.options.onSettled?.(undefined, lastError, variables, context);

		throw lastError;
	}

	reset(): void {
		this.state = {
			data: undefined,
			error: undefined,
			isLoading: false,
			isError: false,
			isSuccess: false,
			isIdle: true,
			status: "idle",
			variables: undefined,
		};
	}

	private sleep(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}
