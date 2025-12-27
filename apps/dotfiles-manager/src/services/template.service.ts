import mustache from "mustache";

export class TemplateService {
	/**
	 * Renders a template with the given data.
	 * @param content The template content.
	 * @param data The data to render.
	 * @returns The rendered content.
	 */
	static render(content: string, data: Record<string, any>): string {
		return mustache.render(content, data);
	}
}
