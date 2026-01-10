import type { DataLoader, MutationOptions, MutationState } from "./types";

export class Mutation<TData = unknown, TVariables = void, TError = unknown> {
  private state: MutationState<TData, TError>;
  private options: MutationOptions<TData, TVariables, TError>;

  constructor(
    private mutator: (variables: TVariables) => Promise<TData>,
    options: MutationOptions<TData, TVariables, TError> = {},
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

        this.options.onSuccess?.(data, variables);
        this.options.onSettled?.(data, undefined, variables);

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

    this.options.onError?.(lastError!, variables);
    this.options.onSettled?.(undefined, lastError, variables);

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
