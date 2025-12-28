import { Effect, Layer } from "@wts/functional";
import { Console, Random } from "./services";

export const program = Effect.gen(function*() {
	const random = yield Effect.get(Random);
	const consoleSvc = yield Effect.get(Console);
	const n = yield random.next();
	yield consoleSvc.log(`Your random number is: ${n}`);
});

const ConsoleLive = Layer.succeed(Console, {
	log: (message: string) =>
		Effect.tap(Effect.succeed(undefined), () => {
			console.log(message);
		}),
});

const RandomLive = Layer.succeed(Random, {
	next: () => Effect.succeed(Math.random()),
});

export const MainLive = Layer.merge(ConsoleLive, RandomLive);
