// A simple EventEmitter to demonstrate the core concept.
type Listener = (payload: any) => void;

export class EventEmitter {
    private listeners: Map<string, Listener[]> = new Map();

    // A component subscribes to an event type.
    public on(eventName: string, listener: Listener): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)!.push(listener);
    }

    // A component unsubscribes from an event type.
    public off(eventName: string, listener: Listener): void {
        if (!this.listeners.has(eventName)) {
            return;
        }
        const stock = this.listeners.get(eventName)!;
        const index = stock.indexOf(listener);
        if (index > -1) {
            stock.splice(index, 1);
        }
    }

    // The emitter broadcasts an event to all subscribers.
    public emit(eventName: string, payload: any): void {
        if (!this.listeners.has(eventName)) {
            return;
        }
        this.listeners.get(eventName)!.forEach(listener => {
            try {
                listener(payload);
            } catch (error) {
                console.error(`Error in listener for event '${eventName}':`, error);
            }
        });
    }
}

// --- Example Components ---

export class OrderService {
    private emitter: EventEmitter;

    constructor(emitter: EventEmitter) {
        this.emitter = emitter;
    }

    public createOrder(orderData: any): void {
        console.log('OrderService: Order created.');
        // Emit an event after creating the order.
        this.emitter.emit('order.created', { ...orderData, timestamp: new Date() });
    }
}

export class NotificationService {
    constructor(emitter: EventEmitter) {
        // Subscribe to the 'order.created' event.
        emitter.on('order.created', this.handleOrderCreated.bind(this));
    }

    public handleOrderCreated(payload: any): void {
        console.log(`NotificationService: Sending email for order ${payload.orderId}...`);
        // Logic to send email/SMS/push notification.
    }
}
