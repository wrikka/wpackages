import { displayConfig } from "../../config/display.config";
import pc from "picocolors";

type Column<T> = {
	name: string;
	width: number;
	align?: "left" | "center" | "right";
	sortable?: boolean;
	render?: (item: T) => string;
};

type ColorFunction = (text: string) => string;

export function Table<T>({
	columns,
	data,
	pagination,
	headerColor = displayConfig.table.headerColor,
	borderColor = displayConfig.table.borderColor,
}: {
	columns: Column<T>[];
	data: T[];
	pagination?: {
		pageSize: number;
		currentPage: number;
	};
	headerColor?: ColorFunction;
	borderColor?: ColorFunction;
}) {
	// Handle pagination
	const pageData = pagination
		? data.slice(
			(pagination.currentPage - 1) * pagination.pageSize,
			pagination.currentPage * pagination.pageSize,
		)
		: data;

	// สร้างเส้นขอบ
	const border = borderColor(
		"┌" + columns.map((c) => "─".repeat(c.width + 2)).join("┬") + "┐",
	);

	// สร้าง header
	const header = columns
		.map((c) => headerColor(c.name.padEnd(c.width).substring(0, c.width)))
		.join(borderColor(" │ "));

	// สร้างเส้นคั่น header
	const headerBorder = borderColor(
		"├" + columns.map((c) => "─".repeat(c.width + 2)).join("┼") + "┤",
	);

	// สร้างแถวข้อมูล
	const rows = pageData.map((row) => {
		return columns
			.map((c) => {
				const value = c.render
					? c.render(row)
					: (row as Record<string, string>)[c.name] || "";
				return value.padEnd(c.width).substring(0, c.width);
			})
			.join(borderColor(" │ "));
	});

	// สร้างเส้นขอบล่าง
	const bottomBorder = borderColor(
		"└" + columns.map((c) => "─".repeat(c.width + 2)).join("┴") + "┘",
	);

	// เพิ่ม pagination info ถ้ามี
	const paginationInfo = pagination
		? pc.dim(
			`Page ${pagination.currentPage} of ${Math.ceil(data.length / pagination.pageSize)}`,
		)
		: "";

	return [
		border,
		borderColor("│ ") + header + borderColor(" │"),
		headerBorder,
		...rows.map((row) => borderColor("│ ") + row + borderColor(" │")),
		bottomBorder,
		paginationInfo,
	]
		.filter(Boolean)
		.join("\n");
}
