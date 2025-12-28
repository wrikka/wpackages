import { PatternMetadata } from "../../core/metadata";

export const metadata: PatternMetadata = {
	name: "Adapter Pattern",
	description: "Allows objects with incompatible interfaces to collaborate.",
	tags: ["structural", "wrapper", "interface"],
};

// The target interface
export interface Target {
	request(): string;
}

// The adaptee with an incompatible interface
export class Adaptee {
	public specificRequest(): string {
		return "Specific request.";
	}
}

// The adapter makes the adaptee's interface compatible with the target's interface
export class Adapter implements Target {
	private adaptee: Adaptee;

	constructor(adaptee: Adaptee) {
		this.adaptee = adaptee;
	}

	public request(): string {
		const result = this.adaptee.specificRequest();
		return `Adapter: (TRANSLATED) ${result}`;
	}
}
