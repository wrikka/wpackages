// The Facade class provides a simple interface to the complex logic of one or
// several subsystems. The Facade delegates the client requests to the
// appropriate objects within the subsystem. The Facade is also responsible for
// managing their lifecycle. All of this shields the client from the undesired
// complexity of the subsystem.
export class Facade {
    protected subsystem1: Subsystem1;
    protected subsystem2: Subsystem2;

    constructor(subsystem1?: Subsystem1, subsystem2?: Subsystem2) {
        this.subsystem1 = subsystem1 || new Subsystem1();
        this.subsystem2 = subsystem2 || new Subsystem2();
    }

    /**
     * The Facade's methods are convenient shortcuts to the sophisticated
     * functionality of the subsystems. However, clients get only to a fraction
     * of a subsystem's capabilities.
     */
    public operation(): string {
        let result = 'Facade initializes subsystems:\n';
        result += this.subsystem1.operation1();
        result += this.subsystem2.operation1();
        result += 'Facade orders subsystems to perform the action:\n';
        result += this.subsystem1.operationN();
        result += this.subsystem2.operationZ();

        return result;
    }
}

// The Subsystem can accept requests either from the facade or client directly.
// In any case, to the Subsystem, the Facade is yet another client, and it's not
// a part of the Subsystem.
class Subsystem1 {
    public operation1(): string {
        return 'Subsystem1: Ready!\n';
    }

    public operationN(): string {
        return 'Subsystem1: Go!\n';
    }
}

// Some subsystems can have dependencies on others. In this case, you can
// establish a dependency between them inside the Facade.
class Subsystem2 {
    public operation1(): string {
        return 'Subsystem2: Get ready!\n';
    }

    public operationZ(): string {
        return 'Subsystem2: Fire!';
    }
}
