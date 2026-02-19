// A simple DI Container
export class DIContainer {
    private services = new Map<string, any>();

    public register(name: string, service: any): void {
        this.services.set(name, service);
    }

    public resolve<T>(name: string): T {
        const service = this.services.get(name);
        if (!service) {
            throw new Error(`Service not found: ${name}`);
        }
        return service as T;
    }
}

// --- Example Services ---

// 1. A simple service interface and implementation
export interface ILogger {
    log(message: string): void;
}

export class ConsoleLogger implements ILogger {
    public log(message: string): void {
        console.log(`[LOG]: ${message}`);
    }
}

// 2. A service that depends on another service
export class UserService {
    private logger: ILogger;

    // The dependency (ILogger) is injected via the constructor
    constructor(logger: ILogger) {
        this.logger = logger;
    }

    public createUser(name: string): void {
        this.logger.log(`Creating user: ${name}`);
        // ... user creation logic
    }
}
