import { Effect, Layer } from "@wts/functional";
import { Console, Random } from "./services";

export const program = Effect.flatMap(Effect.get(Random), random =>
  Effect.flatMap(Effect.get(Console), consoleSvc =>
    Effect.flatMap(random.next(), n =>
      consoleSvc.log(`Your random number is: ${n}`)
    )
  )
);

const ConsoleLive = Layer.succeed(
  Console,
  {
    log: (message: string) => Effect.fromPromise(async () => {
      console.log(message);
    }),
  }
);

const RandomLive = Layer.succeed(
  Random,
  {
    next: () => Effect.fromPromise(async () => Math.random()),
  }
);

export const MainLive = Layer.merge(ConsoleLive, RandomLive);
