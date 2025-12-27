export type EffectCleanup = () => void;

export interface Effect {
	(): void;
	cleanup?: EffectCleanup;
}

export type EffectFunction = Effect;

export type OnCleanup = (cleanup: EffectCleanup) => void;
