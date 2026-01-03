export interface IsEqualOptions {
    customEqual?: (a: any, b: any) => boolean | undefined;
}

export function isObjectLike(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function areArraysEqual(a: readonly unknown[], b: readonly unknown[], seen: WeakMap<object, object>, options: IsEqualOptions): boolean {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (!isEqualInternal(a[i], b[i], seen, options)) return false;
	}
	return true;
}

function areMapsEqual(a: Map<unknown, unknown>, b: Map<unknown, unknown>, seen: WeakMap<object, object>, options: IsEqualOptions): boolean {
    if (a.size !== b.size) return false;
    for (const [aKey, aValue] of a) {
        let found = false;
        for (const [bKey, bValue] of b) {
            if (isEqualInternal(aKey, bKey, seen, options) && isEqualInternal(aValue, bValue, seen, options)) {
                found = true;
                break;
            }
        }
        if (!found) return false;
    }
    return true;
}

function areSetsEqual(a: Set<unknown>, b: Set<unknown>, seen: WeakMap<object, object>, options: IsEqualOptions): boolean {
    if (a.size !== b.size) return false;
    for (const aValue of a) {
        let found = false;
        for (const bValue of b) {
            if (isEqualInternal(aValue, bValue, seen, options)) {
                found = true;
                break;
            }
        }
        if (!found) return false;
    }
    return true;
}

function areObjectsEqual(a: Record<string, unknown>, b: Record<string, unknown>, seen: WeakMap<object, object>, options: IsEqualOptions): boolean {
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(b);
	if (aKeys.length !== bKeys.length) return false;
	for (const key of aKeys) {
		if (!(key in b)) return false;
		if (!isEqualInternal(a[key], b[key], seen, options)) return false;
	}
	return true;
}

function isEqualInternal(a: unknown, b: unknown, seen: WeakMap<object, object>, options: IsEqualOptions): boolean {
    if (options.customEqual) {
        const customResult = options.customEqual(a, b);
        if (customResult !== undefined) {
            return customResult;
        }
    }

	if (Object.is(a, b)) return true;
	if (typeof a !== typeof b) return false;
	if (!isObjectLike(a) || !isObjectLike(b)) return false;

	const existing = seen.get(a as object);
	if (existing) {
		return existing === (b as object);
	}
	seen.set(a as object, b as object);

	if (a instanceof Map) {
        if (!(b instanceof Map)) return false;
        return areMapsEqual(a, b, seen, options);
    }
    if (a instanceof Set) {
        if (!(b instanceof Set)) return false;
        return areSetsEqual(a, b, seen, options);
    }
	if (Array.isArray(a)) {
		if (!Array.isArray(b)) return false;
		return areArraysEqual(a, b, seen, options);
	}
	if (a instanceof Date) {
		if (!(b instanceof Date)) return false;
		return a.getTime() === b.getTime();
	}
	if (a instanceof RegExp) {
		if (!(b instanceof RegExp)) return false;
		return a.toString() === b.toString();
	}

	return areObjectsEqual(a, b, seen, options);
}

export function isEqual(a: unknown, b: unknown, options: IsEqualOptions = {}): boolean {
	return isEqualInternal(a, b, new WeakMap<object, object>(), options);
}
