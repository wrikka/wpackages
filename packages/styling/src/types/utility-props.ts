export type UtilityValue = string | number | boolean | undefined | null;

export type UtilityProps = Record<string, UtilityValue>;

export interface StyledProps extends UtilityProps {
	className?: string;
	class?: string;
}

export interface StyledComponentOptions {
	readonly baseClasses?: string[];
	readonly variants?: Record<string, Record<string, string>>;
	readonly defaultVariants?: Record<string, string>;
}

export interface StyledComponentProps<T extends StyledComponentOptions = StyledComponentOptions>
	extends StyledProps {
	variants?: Partial<Record<keyof T["variants"], string>>;
}

export interface TypeSafeUtilityProps {
	readonly flex?: boolean | "row" | "col" | "row-reverse" | "col-reverse";
	readonly grid?: boolean;
	readonly block?: boolean;
	readonly inline?: boolean;
	readonly inlineBlock?: boolean;
	readonly hidden?: boolean;
	readonly p?: string | number;
	readonly px?: string | number;
	readonly py?: string | number;
	readonly pt?: string | number;
	readonly pr?: string | number;
	readonly pb?: string | number;
	readonly pl?: string | number;
	readonly m?: string | number;
	readonly mx?: string | number;
	readonly my?: string | number;
	readonly mt?: string | number;
	readonly mr?: string | number;
	readonly mb?: string | number;
	readonly ml?: string | number;
	readonly w?: string | number;
	readonly h?: string | number;
	readonly minW?: string | number;
	readonly minH?: string | number;
	readonly maxW?: string | number;
	readonly maxH?: string | number;
	readonly text?: string | number;
	readonly font?: string | number;
	readonly bg?: string;
	readonly border?: string;
	readonly rounded?: string | boolean;
	readonly shadow?: string | boolean;
	readonly opacity?: string | number;
	readonly transition?: string | boolean;
	readonly cursor?: string;
	readonly pointer?: "none" | "auto" | "events-none" | "events-auto";
	readonly select?: "none" | "text" | "all";
	readonly resize?: "none" | "x" | "y" | "both";
	readonly overflow?: string | boolean;
	readonly z?: string | number;
	readonly gap?: string | number;
	readonly space?: string | number;
	readonly divide?: string;
	readonly place?: string;
	readonly items?: string;
	readonly justify?: string;
	readonly content?: string;
	readonly self?: string;
	readonly align?: string;
	readonly order?: string | number;
	readonly box?: string;
	readonly list?: string;
	readonly object?: string;
	readonly fill?: string;
	readonly stroke?: string;
	readonly sr?: boolean;
	readonly notSr?: boolean;
	readonly focus?: string;
	readonly focusWithin?: string;
	readonly focusVisible?: string;
	readonly active?: string;
	readonly visited?: string;
	readonly target?: string;
	readonly first?: string;
	readonly last?: string;
	readonly odd?: string;
	readonly even?: string;
	readonly group?: string;
	readonly peer?: string;
	readonly hover?: string;
	readonly disabled?: string;
	readonly checked?: string;
	readonly indeterminate?: string;
	readonly default?: string;
	readonly required?: string;
	readonly valid?: string;
	readonly invalid?: string;
	readonly inRange?: string;
	readonly outOfRange?: string;
	readonly readOnly?: string;
	readonly placeholderShown?: string;
	readonly autofill?: string;
	readonly marker?: string;
	readonly selection?: string;
	readonly file?: string;
	readonly backdrop?: string;
	readonly before?: string;
	readonly after?: string;
	readonly dark?: string;
	readonly light?: string;
}
