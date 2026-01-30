import { Effect } from "effect";
import { program } from "./app/index";

const main = Effect.runPromiseExit(program).then((exit) => {
  if (exit._tag === "Failure") {
    console.error("Error:", exit.cause);
    process.exit(1);
  }
});

main.catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
