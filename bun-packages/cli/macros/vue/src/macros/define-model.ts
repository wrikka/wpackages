export function defineModel<T>(_name?: string, options?: { default: T }): T {
	return options?.default ?? ({} as T);
}
