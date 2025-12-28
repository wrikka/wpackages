import { Effect } from "@wts/functional";
import { describe, expect, test } from "vitest";
import { CommandLive, run } from "./index";

describe("@wts/command", () => {
	test("run should execute a command and return stdout", async () => {
		const program = run(process.execPath, ["-e", "process.stdout.write('ok')"]);
		const result = await Effect.runPromiseEither(Effect.provideLayer(program, CommandLive));
		expect(result._tag).toBe("Right");
		if (result._tag !== "Right") {
			throw new Error("Expected Right");
		}
		expect(result.right.stdout).toBe("ok");
	});
});
