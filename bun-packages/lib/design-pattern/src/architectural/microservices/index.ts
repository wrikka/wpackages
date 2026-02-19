// This is a conceptual demonstration of Microservices communication.

// A simple, in-memory message bus to simulate asynchronous communication.
class MessageBus {
    private listeners: Map<string, ((payload: any) => void)[]> = new Map();

    public subscribe(topic: string, callback: (payload: any) => void): void {
        if (!this.listeners.has(topic)) {
            this.listeners.set(topic, []);
        }
        this.listeners.get(topic)!.push(callback);
    }

    public publish(topic: string, payload: any): void {
        if (this.listeners.has(topic)) {
            this.listeners.get(topic)!.forEach(callback => callback(payload));
        }
    }
}

// --- User Service ---
// Responsible for user management.
export class UserService {
    private messageBus: MessageBus;

    constructor(messageBus: MessageBus) {
        this.messageBus = messageBus;
    }

    public createUser(name: string, userId: string): void {
        console.log(`UserService: Creating user '${name}'.`);
        // After creating the user, publish an event.
        this.messageBus.publish('user.created', { userId, name });
    }
}

// --- Order Service ---
// Responsible for order management.
export class OrderService {
    private messageBus: MessageBus;

    constructor(messageBus: MessageBus) {
        this.messageBus = messageBus;
        // Subscribe to events from other services.
        this.messageBus.subscribe('user.created', this.handleUserCreated.bind(this));
    }

    private handleUserCreated(payload: { userId: string; name: string }): void {
        console.log(`OrderService: Received user.created event for '${payload.name}'.`);
        // Logic to create an initial empty order profile, for example.
    }

    public createOrder(userId: string, orderId: string): void {
        console.log(`OrderService: Creating order '${orderId}' for user '${userId}'.`);
        this.messageBus.publish('order.created', { userId, orderId });
    }
}

// Main application setup
export function setupMicroservices() {
    const messageBus = new MessageBus();
    const userService = new UserService(messageBus);
    const orderService = new OrderService(messageBus);

    return { userService, orderService };
}
