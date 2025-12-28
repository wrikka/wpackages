import { Effect } from "@wts/functional";
import { program, MainLive } from "./app";

const runnable = Effect.provideLayer(program, MainLive);

const main = async () => {
    const result = await Effect.runPromise(runnable);
    if (result._tag === "Left") {
        console.error("Program failed with:", result.left);
    }
};

main();
