import { PatternMetadata } from "../../core/metadata";

export const metadata: PatternMetadata = {
	name: "Singleton Pattern",
	description: "Ensures a class has only one instance and provides a global point of access to it.",
	tags: ["creational", "single instance", "global access"],
};

export class Singleton {
	private static instance: Singleton;
	public readonly timestamp: number;

	private constructor() {
		this.timestamp = Date.now();
	}

	public static getInstance(): Singleton {
		if (!Singleton.instance) {
			Singleton.instance = new Singleton();
		}
		return Singleton.instance;
	}

	public someBusinessLogic() {
		// ...
	}
}
