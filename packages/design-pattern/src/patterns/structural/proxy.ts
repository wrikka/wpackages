import { Effect } from "effect";

// Subject Interface
export interface Image {
	readonly display: Effect.Effect<string>;
}

// Real Subject
const createRealImage = (filename: string): Image => ({
	display: Effect.sync(() => `Displaying ${filename}`),
});

// Proxy
export const createProxyImage = (filename: string): Image => {
	let realImage: Image | null = null;

	return {
		display: Effect.suspend(() => {
			if (realImage === null) {
				realImage = createRealImage(filename);
			}
			return realImage.display;
		}),
	};
};
