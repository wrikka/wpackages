export interface ListProps {
	items: string[];
	ordered?: boolean;
	bullet?: string;
	padding?: number;
}

export const List = (props: ListProps): string => {
	const { items, ordered = false, bullet = "•", padding = 0 } = props;

	const lines = items.map((item, index) => {
		const prefix = ordered ? `${index + 1}.` : bullet;
		const indent = " ".repeat(padding);
		return `${indent}${prefix} ${item}`;
	});

	return lines.join("\n");
};
