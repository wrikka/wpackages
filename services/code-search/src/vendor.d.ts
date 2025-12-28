declare module "oxc-parser" {
	export type ParseResult = { readonly program: unknown };
	export function parseSync(fileName: string, sourceText: string): ParseResult;
}

declare module "@ast-grep/napi" {
	export const Lang: Record<string, unknown>;
	export function parse(lang: unknown, source: string): { root(): unknown };
	export function pattern(lang: unknown, matcher: string): unknown;
}
