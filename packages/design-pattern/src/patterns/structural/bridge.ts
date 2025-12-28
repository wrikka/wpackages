import { Effect } from "effect";

// Abstraction: Defines the high-level control interface for some entity.
export interface RemoteControl {
	readonly togglePower: Effect.Effect<void>;
	readonly volumeUp: Effect.Effect<void>;
	readonly volumeDown: Effect.Effect<void>;
}

// Implementation: Defines the interface for all implementation classes.
export interface Device {
	readonly isEnabled: Effect.Effect<boolean>;
	readonly enable: Effect.Effect<void>;
	readonly disable: Effect.Effect<void>;
	readonly getVolume: Effect.Effect<number>;
	readonly setVolume: (percent: number) => Effect.Effect<void>;
}

// Concrete Implementation: TV
export const createTv = () => {
	let power = false;
	let volume = 50;

	return {
		isEnabled: Effect.sync(() => power),
		enable: Effect.sync(() => {
			power = true;
		}),
		disable: Effect.sync(() => {
			power = false;
		}),
		getVolume: Effect.sync(() => volume),
		setVolume: (percent: number) =>
			Effect.sync(() => {
				volume = Math.max(0, Math.min(100, percent));
			}),
	} satisfies Device;
};

// Refined Abstraction: A basic remote control.
export const createBasicRemote = (device: Device): RemoteControl => ({
	togglePower: Effect.gen(function*() {
		if (yield* device.isEnabled) {
			yield* device.disable;
		} else {
			yield* device.enable;
		}
	}),
	volumeUp: Effect.gen(function*() {
		const currentVolume = yield* device.getVolume;
		yield* device.setVolume(currentVolume + 10);
	}),
	volumeDown: Effect.gen(function*() {
		const currentVolume = yield* device.getVolume;
		yield* device.setVolume(currentVolume - 10);
	}),
});
