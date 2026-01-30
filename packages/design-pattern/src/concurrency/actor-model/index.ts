// A simple message type
type Message = { type: string; payload?: any };

// Abstract Actor class
abstract class Actor {
    protected address: string;
    protected actorSystem: ActorSystem;

    constructor(address: string, actorSystem: ActorSystem) {
        this.address = address;
        this.actorSystem = actorSystem;
    }

    abstract onReceive(message: Message): void;

    protected send(address: string, message: Message): void {
        this.actorSystem.dispatch(address, message);
    }
}

// A concrete Actor implementation
export class GreeterActor extends Actor {
    onReceive(message: Message): void {
        switch (message.type) {
            case 'GREET':
                console.log(`Hello, ${message.payload.name}!`);
                break;
            case 'RESPOND':
                console.log('Greeter responding!');
                this.send(message.payload.replyTo, { type: 'GREETING_RESPONSE' });
                break;
        }
    }
}

export class ResponderActor extends Actor {
    onReceive(message: Message): void {
        if (message.type === 'GREETING_RESPONSE') {
            console.log('Responder received a greeting response.');
        }
    }
}

// The Actor System manages the actors
export class ActorSystem {
    private actors: Map<string, Actor> = new Map();

    public createActor(actorClass: new (address: string, actorSystem: ActorSystem) => Actor, address: string): Actor {
        if (this.actors.has(address)) {
            throw new Error(`Actor with address ${address} already exists.`);
        }
        const actor = new actorClass(address, this);
        this.actors.set(address, actor);
        return actor;
    }

    public dispatch(address: string, message: Message): void {
        const actor = this.actors.get(address);
        if (actor) {
            // In a real system, this would be asynchronous
            setTimeout(() => actor.onReceive(message), 0);
        } else {
            console.warn(`Actor with address ${address} not found.`);
        }
    }
}
