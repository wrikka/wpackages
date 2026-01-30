import type { Resource as IResource } from "../types/tracing";

export class Resource implements IResource {
	readonly attributes: Record<string, unknown>;

	constructor(attributes: Record<string, unknown>) {
		this.attributes = attributes;
	}

	merge(other: Resource): Resource {
		return new Resource({
			...this.attributes,
			...other.attributes,
		});
	}
}
