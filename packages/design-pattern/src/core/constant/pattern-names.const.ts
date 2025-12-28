/**
 * Design Pattern Names Constants
 * Standard names for all GoF design patterns
 */

export const PATTERN_NAMES = {
	// Creational Patterns
	SINGLETON: "Singleton",
	FACTORY: "Factory",
	ABSTRACT_FACTORY: "AbstractFactory",
	BUILDER: "Builder",
	PROTOTYPE: "Prototype",

	// Structural Patterns
	ADAPTER: "Adapter",
	BRIDGE: "Bridge",
	COMPOSITE: "Composite",
	DECORATOR: "Decorator",
	FACADE: "Facade",
	FLYWEIGHT: "Flyweight",
	PROXY: "Proxy",

	// Behavioral Patterns
	CHAIN_OF_RESPONSIBILITY: "ChainOfResponsibility",
	COMMAND: "Command",
	INTERPRETER: "Interpreter",
	ITERATOR: "Iterator",
	MEDIATOR: "Mediator",
	MEMENTO: "Memento",
	OBSERVER: "Observer",
	STATE: "State",
	STRATEGY: "Strategy",
	TEMPLATE_METHOD: "TemplateMethod",
	VISITOR: "Visitor",
} as const;

export type PatternName = (typeof PATTERN_NAMES)[keyof typeof PATTERN_NAMES];

export const PATTERN_CATEGORIES = {
	CREATIONAL: ["Singleton", "Factory", "AbstractFactory", "Builder", "Prototype"],
	STRUCTURAL: ["Adapter", "Bridge", "Composite", "Decorator", "Facade", "Flyweight", "Proxy"],
	BEHAVIORAL: [
		"ChainOfResponsibility",
		"Command",
		"Interpreter",
		"Iterator",
		"Mediator",
		"Memento",
		"Observer",
		"State",
		"Strategy",
		"TemplateMethod",
		"Visitor",
	],
} as const;
