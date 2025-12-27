// TODO: effect not available
import * as Shapes from "../shapes";
import type { CanvasState } from "../state";

// TODO: effect not available
export const toSVG = (state: CanvasState): string => {
	const shapes = Object.values(state.shapes);
	const paths = shapes.map((shape) => {
		switch (shape.type) {
			case "rectangle":
				return Shapes.Rectangle.toSVGPath(shape);
			case "circle":
				return Shapes.Circle.toSVGPath(shape);
			case "line":
				return Shapes.Line.toSVGPath(shape);
			case "arrow":
				return Shapes.Arrow.toSVGPath(shape);
			case "path":
				return Shapes.Path.toSVGPath(shape);
			default:
				return "";
		}
	});

	return `
          <svg xmlns="http://www.w3.org/2000/svg" 
               width="${state.viewport.width}" 
               height="${state.viewport.height}">
            ${paths.map((path) => `<path d="${path}" />`).join("\n")}
          </svg>
        `.trim();
};
