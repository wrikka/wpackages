import { Context, Effect, Layer } from "effect";

export interface IdGeneratorService {
	readonly nextId: Effect.Effect<string>;
}

export const IdGeneratorService = Context.GenericTag<IdGeneratorService>("IdGeneratorService");

const makeId = (): string => `notif_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

export const IdGeneratorServiceLive: Layer.Layer<IdGeneratorService> = Layer.succeed(
	IdGeneratorService,
	{
		nextId: Effect.sync(makeId),
	},
);

export const IdGeneratorServiceFixed = (id: string): Layer.Layer<IdGeneratorService> =>
	Layer.succeed(IdGeneratorService, {
		nextId: Effect.succeed(id),
	});
