import type { Computed } from "./computed.type";
import type { Ref } from "./ref.type";

export type ResourceActions<T> = {
	loading: Computed<boolean>;
	error: Ref<unknown>;
	refetch: () => Promise<T | undefined>;
};

export type Resource<T> = [Ref<T | undefined>, ResourceActions<T>];
