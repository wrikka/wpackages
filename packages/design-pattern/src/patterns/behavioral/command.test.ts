import { describe, expect, it, vi } from "vitest";
import { ComplexCommand, Invoker, Receiver, SimpleCommand } from "./command";

describe("Command Pattern", () => {
	it("should execute commands via invoker", () => {
		const invoker = new Invoker();
		const receiver = new Receiver();
		const simpleCommand = new SimpleCommand("Say Hi!");
		const complexCommand = new ComplexCommand(receiver, "Send email", "Save report");

		const simpleSpy = vi.spyOn(simpleCommand, "execute");
		const complexSpy = vi.spyOn(complexCommand, "execute");

		invoker.setOnStart(simpleCommand);
		invoker.setOnFinish(complexCommand);

		invoker.doSomethingImportant();

		expect(simpleSpy).toHaveBeenCalled();
		expect(complexSpy).toHaveBeenCalled();
	});
});
