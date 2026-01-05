export function createKey(): string {
	return Math.random().toString(36).substring(2, 8);
}
