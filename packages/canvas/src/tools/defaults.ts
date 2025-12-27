import type { Tool } from "./types";

export const defaultTools: Tool[] = [
	{ cursor: "default", name: "Select", type: "select" },
	{ cursor: "crosshair", name: "Rectangle", type: "rectangle" },
	{ cursor: "crosshair", name: "Circle", type: "circle" },
	{ cursor: "crosshair", name: "Line", type: "line" },
	{ cursor: "crosshair", name: "Arrow", type: "arrow" },
	{ cursor: "text", name: "Text", type: "text" },
	{ cursor: "crosshair", name: "Pen", type: "pen" },
	{ cursor: "pointer", name: "Eraser", type: "eraser" },
	{ cursor: "grab", name: "Pan", type: "pan" },
];
