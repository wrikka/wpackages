/**
 * Flyweight Pattern - Pure functional implementation
 */

export const createFlyweightFactory = <TIntrinsic, TExtrinsic, TResult>(
	creator: (intrinsic: TIntrinsic) => (extrinsic: TExtrinsic) => TResult,
) => {
	const cache = new Map<string, (extrinsic: TExtrinsic) => TResult>();
	return {
		get: (
			intrinsic: TIntrinsic,
			key: string = JSON.stringify(intrinsic),
		): (extrinsic: TExtrinsic) => TResult => {
			if (!cache.has(key)) {
				cache.set(key, creator(intrinsic));
			}
			return cache.get(key) as (extrinsic: TExtrinsic) => TResult;
		},
		size: (): number => cache.size,
		clear: (): void => cache.clear(),
	};
};
