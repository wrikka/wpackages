import type { ChartProps } from "../types/schema";
import { h } from "../types/vnode";
import { CHART_CHARS } from "../constant/widget.const";

type ChartComponentProps = ChartProps;

export const Chart = (props: ChartComponentProps): ReturnType<typeof h> => {
	const {
		data,
		labels = [],
		type = "line",
		color = "cyan",
		showAxes = true,
		showGrid = true,
		...rest
	} = props;

	if (data.length === 0) {
		return h("text", { color }, "No data");
	}

	const maxDataValue = Math.max(...data.flat());
	const minDataValue = Math.min(...data.flat());
	const range = maxDataValue - minDataValue || 1;
	const height = 10;
	const width = 30;

	const rows: string[] = [];

	for (let y = height; y >= 0; y--) {
		const _yValue = minDataValue + (y / height) * range;
		const row: string[] = [];

		if (showAxes && y === 0) {
			row.push(CHART_CHARS.axisHorizontal.repeat(width + 2));
		} else {
			row.push(showGrid && y % 2 === 0 ? CHART_CHARS.grid : " ");
		}

		for (let x = 0; x < width; x++) {
			if (x >= data[0].length) {
				row.push(" ");
				continue;
			}

			const dataValue = data[0][x];
			const normalizedY = ((dataValue - minDataValue) / range) * height;
			const isPoint = Math.abs(normalizedY - y) < 0.5;

			if (type === "line" && isPoint) {
				row.push(CHART_CHARS.point);
			} else if (type === "bar") {
				const barHeight = Math.floor(
					((dataValue - minDataValue) / range) * height,
				);
				row.push(y <= barHeight ? CHART_CHARS.filled : CHART_CHARS.empty);
			} else {
				row.push(" ");
			}
		}

		rows.push(row.join(""));
	}

	if (labels.length > 0) {
		const labelRow = labels
			.slice(0, width)
			.map((label) => label[0])
			.join(" ");
		rows.push(" " + labelRow);
	}

	return h(
		"box",
		{
			...rest,
			flexDirection: "column",
			borderStyle: showAxes ? "single" : undefined,
			borderColor: color,
		},
		...rows.map((row) => h("text", { color }, row)),
	);
};
