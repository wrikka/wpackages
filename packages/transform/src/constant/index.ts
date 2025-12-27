import {
	JsonToMarkdownTransformer,
	JsonToTomlTransformer,
	MarkdownToJsonTransformer,
	TomlToJsonTransformer,
	TomlToMarkdownTransformer,
	TypeScriptToJsonTransformer,
	TypeScriptToMarkdownTransformer,
} from "../components";

export const transformerMap = new Map([
	["json->toml", JsonToTomlTransformer],
	["toml->json", TomlToJsonTransformer],
	["json->markdown", JsonToMarkdownTransformer],
	["markdown->json", MarkdownToJsonTransformer],
	["typescript->json", TypeScriptToJsonTransformer],
	["typescript->markdown", TypeScriptToMarkdownTransformer],
	["toml->markdown", TomlToMarkdownTransformer],
]);
