import { Context, Data, Effect, Layer, Ref } from "effect";
import type {
	DistributedLock,
	DistributedLockManager,
	LockOptions,
	LockType,
} from "../../types/distributed";

export class LockError extends Data.TaggedError("LockError")<{
	reason: string;
}> {}

const makeLockManager = Effect.gen(function* () {
	const locks = yield* Ref.make(new Map<string, DistributedLock>());

	const acquire = (resourceId: string, options: LockOptions) =>
		Effect.gen(function* () {
			const now = new Date();
			const lockId = crypto.randomUUID();
			const ownerId = crypto.randomUUID();

			const lock: DistributedLock = {
				id: lockId,
				type: "job" as LockType,
				resourceId,
				ownerId,
				acquiredAt: now,
				expiresAt: new Date(now.getTime() + options.ttl),
			};

			yield* Ref.update(locks, (map) => {
				const existing = map.get(resourceId);
				if (existing && existing.expiresAt > now) {
					return map;
				}
				map.set(resourceId, lock);
				return map;
			});

			return lock;
		});

	const release = (lockId: string) =>
		Effect.gen(function* () {
			yield* Ref.update(locks, (map) => {
				for (const [resourceId, lock] of map.entries()) {
					if (lock.id === lockId) {
						map.delete(resourceId);
						break;
					}
				}
				return map;
			});
		});

	const extend = (lockId: string, ttl: number) =>
		Effect.gen(function* () {
			const now = new Date();
			const lockMap = yield* Ref.get(locks);

			for (const [resourceId, lock] of lockMap.entries()) {
				if (lock.id === lockId) {
					if (lock.expiresAt <= now) {
						return false;
					}
					const updated = { ...lock, expiresAt: new Date(now.getTime() + ttl) };
					yield* Ref.update(locks, (map) => {
						map.set(resourceId, updated);
						return map;
					});
					return true;
				}
			}
			return false;
		});

	const isLocked = (resourceId: string) =>
		Ref.get(locks).pipe(
			Effect.map((map) => {
				const lock = map.get(resourceId);
				return lock ? lock.expiresAt > new Date() : false;
			}),
		);

	const heartbeat = (lockId: string, interval: number) =>
		Effect.gen(function* () {
			while (true) {
				yield* Effect.sleep(interval);
				const extended = yield* extend(lockId, interval * 2);
				if (!extended) {
					break;
				}
			}
		}).pipe(Effect.fork);

	return { acquire, release, extend, isLocked, heartbeat };
});

export class DistributedLockManagerTag extends Context.Tag(
	"@wpackages/DistributedLockManager",
)<DistributedLockManagerTag, DistributedLockManager>() {}

export const DistributedLockManagerLive = Layer.effect(
	DistributedLockManagerTag,
	makeLockManager,
);
