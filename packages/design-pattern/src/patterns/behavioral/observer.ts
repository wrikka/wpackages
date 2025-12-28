import { PatternMetadata } from "../../core/metadata";

export const metadata: PatternMetadata = {
	name: "Observer Pattern",
	description:
		"Defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.",
	tags: ["behavioral", "publish-subscribe", "events"],
};

export interface Observer {
	update(subject: Subject): void;
}

export interface Subject {
	attach(observer: Observer): void;
	detach(observer: Observer): void;
	notify(): void;
}

export class ConcreteSubject implements Subject {
	public state: number = 0;
	private observers: Observer[] = [];

	public attach(observer: Observer): void {
		const isExist = this.observers.includes(observer);
		if (isExist) {
			return;
		}
		this.observers.push(observer);
	}

	public detach(observer: Observer): void {
		const observerIndex = this.observers.indexOf(observer);
		if (observerIndex === -1) {
			return;
		}
		this.observers.splice(observerIndex, 1);
	}

	public notify(): void {
		for (const observer of this.observers) {
			observer.update(this);
		}
	}

	public someBusinessLogic(): void {
		this.state = Math.floor(Math.random() * (10 + 1));
		this.notify();
	}
}

export class ConcreteObserverA implements Observer {
	public update(subject: Subject): void {
		if (subject instanceof ConcreteSubject && subject.state < 5) {
			// ...
		}
	}
}

export class ConcreteObserverB implements Observer {
	public update(subject: Subject): void {
		if (subject instanceof ConcreteSubject && subject.state >= 5) {
			// ...
		}
	}
}
