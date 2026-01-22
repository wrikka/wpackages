import { Schema } from "@effect/schema";

export const Language = Schema.Literal(
	"javascript",
	"typescript",
	"python",
	"java",
	"csharp",
	"go",
	"rust",
	"cpp",
	"c",
	"php",
	"ruby",
	"swift",
	"kotlin",
	"dart",
	"scala",
	"haskell",
	"elixir",
	"erlang",
	"clojure",
	"fsharp",
	"r",
	"julia",
	"lua",
	"perl",
	"bash",
	"powershell",
	"sql",
	"html",
	"css",
	"json",
	"yaml",
	"xml",
	"markdown",
);

export type Language = Schema.Schema.Type<typeof Language>;

export const TranslationRequest = Schema.Struct({
	sourceCode: Schema.String,
	sourceLanguage: Language,
	targetLanguage: Language,
	options: Schema.optional(
		Schema.Struct({
			preserveComments: Schema.optional(Schema.Boolean),
			preserveFormatting: Schema.optional(Schema.Boolean),
			includeImports: Schema.optional(Schema.Boolean),
			strictMode: Schema.optional(Schema.Boolean),
		}),
	),
});

export type TranslationRequest = Schema.Schema.Type<typeof TranslationRequest>;

export const TranslationResult = Schema.Struct({
	translatedCode: Schema.String,
	sourceLanguage: Language,
	targetLanguage: Language,
	confidence: Schema.Number,
	warnings: Schema.optional(Schema.Array(Schema.String)),
});

export type TranslationResult = Schema.Schema.Type<typeof TranslationResult>;

export const TranslationError = Schema.Union(
	Schema.Struct({
		_tag: Schema.Literal("UnsupportedLanguage"),
		message: Schema.String,
	}),
	Schema.Struct({
		_tag: Schema.Literal("InvalidCode"),
		message: Schema.String,
		line: Schema.optional(Schema.Number),
		column: Schema.optional(Schema.Number),
	}),
	Schema.Struct({
		_tag: Schema.Literal("TranslationFailed"),
		message: Schema.String,
		details: Schema.optional(Schema.String),
	}),
	Schema.Struct({
		_tag: Schema.Literal("NetworkError"),
		message: Schema.String,
	}),
);

export type TranslationError = Schema.Schema.Type<typeof TranslationError>;
