type Style = (text: string) => string;

export interface Theme {
	message: Style;
	placeholder: Style;
	value: Style;
	cursor: Style;
	error: Style;
	info: Style;
}
