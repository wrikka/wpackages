import { Effect } from "effect";
import { expect, test } from "vitest";
import { createMacFactory, createWinFactory, GUIFactory } from "./abstract-factory";

const application = (factory: GUIFactory) =>
	Effect.gen(function*() {
		const button = yield* factory.createButton;
		const checkbox = yield* factory.createCheckbox;
		const buttonText = yield* button.paint;
		const checkboxText = yield* checkbox.paint;
		return { buttonText, checkboxText };
	});

test("Abstract Factory Pattern with Windows Factory", () => {
	const factory = createWinFactory();
	const result = Effect.runSync(application(factory));

	expect(result.buttonText).toBe("Painting a Windows button");
	expect(result.checkboxText).toBe("Painting a Windows checkbox");
});

test("Abstract Factory Pattern with macOS Factory", () => {
	const factory = createMacFactory();
	const result = Effect.runSync(application(factory));

	expect(result.buttonText).toBe("Painting a macOS button");
	expect(result.checkboxText).toBe("Painting a macOS checkbox");
});
