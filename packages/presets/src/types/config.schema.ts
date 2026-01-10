import { Schema } from "@effect/schema";
import type { ThemeMode } from "./theme";

export const ThemeModeSchema: Schema.Schema<ThemeMode> = Schema.Literal("light", "dark", "auto");

export const ColorPaletteSchema = Schema.Struct({
	primary: Schema.String,
	secondary: Schema.String,
	background: Schema.String,
	foreground: Schema.String,
	surface: Schema.String,
	border: Schema.String,
	error: Schema.String,
	warning: Schema.String,
	success: Schema.String,
	info: Schema.String,
});

export const TypographySchema = Schema.Struct({
	fontFamily: Schema.String,
	fontSize: Schema.Struct({
		xs: Schema.String,
		sm: Schema.String,
		base: Schema.String,
		lg: Schema.String,
		xl: Schema.String,
	}),
	fontWeight: Schema.Struct({
		normal: Schema.Number,
		medium: Schema.Number,
		semibold: Schema.Number,
		bold: Schema.Number,
	}),
	lineHeight: Schema.Struct({
		tight: Schema.Number,
		normal: Schema.Number,
		relaxed: Schema.Number,
	}),
});

export const SpacingSchema = Schema.Struct({
	xs: Schema.String,
	sm: Schema.String,
	md: Schema.String,
	lg: Schema.String,
	xl: Schema.String,
});

export const BorderRadiusSchema = Schema.Struct({
	sm: Schema.String,
	md: Schema.String,
	lg: Schema.String,
	full: Schema.String,
});

export const ThemeSchema = Schema.Struct({
	mode: ThemeModeSchema,
	colors: ColorPaletteSchema,
	typography: TypographySchema,
	spacing: SpacingSchema,
	borderRadius: BorderRadiusSchema,
});
