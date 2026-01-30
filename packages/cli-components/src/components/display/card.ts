import { Text } from "./text";

export interface CardProps {
	title?: string;
	content: string;
	borderColor?: string;
	padding?: number;
}

export const Card = (props: CardProps): string => {
	const { title, content, borderColor = "gray" } = props;

	let cardContent = "";

	if (title) {
		cardContent += Text({
			children: title,
			color: borderColor as any,
			bold: true,
		}) + "\n\n";
	}

	cardContent += content;

	return cardContent;
};
