import type { CanvasState } from "../types";
import * as Shape from "./shape";

export const toJSON = (state: CanvasState): string => {
	return JSON.stringify(state, null, 2);
};

export const fromJSON = (json: string): CanvasState => {
	return JSON.parse(json) as CanvasState;
};

export const toSVG = (state: CanvasState): string => {
	const shapes = Object.values(state.shapes);
	const paths = shapes.map((shape) => Shape.shapeToSVGPath(shape));

	return `
    <svg xmlns="http://www.w3.org/2000/svg" 
         width="${state.viewport.width}" 
         height="${state.viewport.height}">
      ${paths.map((path) => `<path d="${path}" />`).join("\n")}
    </svg>
  `.trim();
};

export const toPNG = (
	canvas: HTMLCanvasElement,
): Promise<Blob> =>
	new Promise((resolve, reject) => {
		canvas.toBlob((blob) => {
			if (blob) {
				resolve(blob);
			} else {
				reject(new Error("Failed to create PNG"));
			}
		});
	});
