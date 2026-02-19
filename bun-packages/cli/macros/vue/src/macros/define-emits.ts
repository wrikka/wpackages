export function defineEmits<T extends Record<string, unknown[]>>(): {
	<K extends keyof T>(event: K, ...args: T[K]): void;
} {
	return {} as any;
}
