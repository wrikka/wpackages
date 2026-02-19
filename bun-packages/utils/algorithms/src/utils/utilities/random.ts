export function randomInt(min: number, max: number): number {
	if (min > max) {
		[min, max] = [max, min];
	}
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number): number {
	if (min > max) {
		[min, max] = [max, min];
	}
	return Math.random() * (max - min) + min;
}

export function randomChoice<T>(array: ReadonlyArray<T>): T {
	if (array.length === 0) {
		throw new Error("Cannot choose from empty array");
	}
	return array[randomInt(0, array.length - 1)]!;
}

export function randomString(length: number, charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"): string {
	let result = "";
	for (let i = 0; i < length; i++) {
		result += charset[randomInt(0, charset.length - 1)];
	}
	return result;
}

export function randomBoolean(): boolean {
	return Math.random() < 0.5;
}

export function randomUUID(): string {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}
