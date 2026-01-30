// A generic Registry class
export class Registry {
    private static services = new Map<string, any>();

    public static register<T>(key: string, instance: T): void {
        if (this.services.has(key)) {
            console.warn(`Registry: Service with key '${key}' is being overwritten.`);
        }
        this.services.set(key, instance);
    }

    public static get<T>(key: string): T {
        const instance = this.services.get(key);
        if (!instance) {
            throw new Error(`Registry: Service with key '${key}' not found.`);
        }
        return instance as T;
    }

    public static clear(): void {
        this.services.clear();
    }
}

// --- Example Usage ---

export interface IConfigService {
    get(key: string): string | undefined;
}

export class ConfigService implements IConfigService {
    private config: Record<string, string>;

    constructor(initialConfig: Record<string, string>) {
        this.config = initialConfig;
    }

    public get(key: string): string | undefined {
        return this.config[key];
    }
}
