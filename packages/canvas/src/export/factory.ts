import * as JSON from "./json";
import * as PNG from "./png";
import * as SVG from "./svg";

export const makeExportService = () => {
	return {
		fromJSON: JSON.fromJSON,
		toJSON: JSON.toJSON,
		toPNG: PNG.toPNG,
		toSVG: SVG.toSVG,
	};
};
