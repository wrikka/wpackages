import { Eta } from "eta";
import { hostname, platform } from "node:os";

const eta = new Eta();

export class TemplateService {
	/**
	 * Renders a template with the given data.
	 * @param content The template content.
	 * @param data The data to render.
	 * @returns The rendered content.
	 */
	static render(content: string, data: Record<string, any>): string {
		const context = {
			...data,
			chezmoi: {
				os: platform(),
				hostname: hostname(),
			},
		};
		return eta.render(content, context) as string;
	}
}
