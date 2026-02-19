// The Abstraction defines the interface for the "control" part of the two class
// hierarchies. It maintains a reference to an object of the Implementation
// hierarchy and delegates all of the real work to this object.
export class Abstraction {
    protected implementation: Implementation;

    constructor(implementation: Implementation) {
        this.implementation = implementation;
    }

    public operation(): string {
        const result = this.implementation.operationImplementation();
        return `Abstraction: Base operation with:\n${result}`;
    }
}

// You can extend the Abstraction without changing the Implementation classes.
export class ExtendedAbstraction extends Abstraction {
    public operation(): string {
        const result = this.implementation.operationImplementation();
        return `ExtendedAbstraction: Extended operation with:\n${result}`;
    }
}

// The Implementation defines the interface for all implementation classes. It
// doesn't have to match the Abstraction's interface. In fact, the two
// interfaces can be entirely different.
export interface Implementation {
    operationImplementation(): string;
}

// Each Concrete Implementation corresponds to a specific platform and
// implements the Implementation interface using that platform's API.
export class ConcreteImplementationA implements Implementation {
    public operationImplementation(): string {
        return 'ConcreteImplementationA: Here\'s the result on platform A.';
    }
}

export class ConcreteImplementationB implements Implementation {
    public operationImplementation(): string {
        return 'ConcreteImplementationB: Here\'s the result on platform B.';
    }
}
