// TODO: effect not available
import type { CanvasState } from "../types";

export const toPNG = (_state: CanvasState, canvas: HTMLCanvasElement) =>
	new Promise<Blob>((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) resolve(blob);
			else reject(new Error("Failed to create PNG"));
		});
	});
