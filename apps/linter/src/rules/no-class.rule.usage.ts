/**
 * Usage examples for no-class rule
 */

// ❌ Bad - Using classes
class _User {
	constructor(
		public name: string,
		public email: string,
	) {}

	greet() {
		return `Hello, ${this.name}`;
	}
}

// ✅ Good - Using functions and objects
type User2 = {
	readonly name: string;
	readonly email: string;
};

const _createUser = (name: string, email: string): User2 => ({
	name,
	email,
});

const _greet = (user: User2): string => `Hello, ${user.name}`;

// ❌ Bad - Class with inheritance
class Animal {
	constructor(public name: string) {}
}

class _Dog extends Animal {
	bark() {
		return "Woof!";
	}
}

// ✅ Good - Composition over inheritance
type Animal2 = {
	readonly name: string;
};

type Dog2 = Animal2 & {
	readonly breed: string;
};

const createAnimal = (name: string): Animal2 => ({ name });

const _createDog = (name: string, breed: string): Dog2 => ({
	...createAnimal(name),
	breed,
});

const _bark = (_dog: Dog2): string => "Woof!";

