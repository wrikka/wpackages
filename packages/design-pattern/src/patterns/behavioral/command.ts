import { PatternMetadata } from "../../core/metadata";

export const metadata: PatternMetadata = {
	name: "Command Pattern",
	description:
		"Turns a request into a stand-alone object that contains all information about the request. This transformation lets you pass requests as a method arguments, delay or queue a request's execution, and support undoable operations.",
	tags: ["behavioral", "request", "undo"],
};

export interface Command {
	execute(): void;
}

export class SimpleCommand implements Command {
	constructor(private payload: string) {}

	public execute(): void {
		console.log(`SimpleCommand: See, I can do simple things like printing (${this.payload})`);
	}
}

export class Receiver {
	public doSomething(a: string): void {
		console.log(`Receiver: Working on (${a}.)`);
	}

	public doSomethingElse(b: string): void {
		console.log(`Receiver: Also working on (${b}.)`);
	}
}

export class ComplexCommand implements Command {
	constructor(private receiver: Receiver, private a: string, private b: string) {}

	public execute(): void {
		this.receiver.doSomething(this.a);
		this.receiver.doSomethingElse(this.b);
	}
}

export class Invoker {
	private onStart!: Command;
	private onFinish!: Command;

	public setOnStart(command: Command): void {
		this.onStart = command;
	}

	public setOnFinish(command: Command): void {
		this.onFinish = command;
	}

	public doSomethingImportant(): void {
		if (this.onStart) {
			this.onStart.execute();
		}

		// ... business logic

		if (this.onFinish) {
			this.onFinish.execute();
		}
	}
}
