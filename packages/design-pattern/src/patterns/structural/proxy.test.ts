import { Effect } from "effect";
import { expect, test } from "vitest";
import { createProxyImage } from "./proxy";

test("Proxy Pattern", () => {
	const image = createProxyImage("test.jpg");

	// The real image is not created until display is called
	const result = Effect.runSync(image.display);

	expect(result).toBe("Displaying test.jpg");
});
