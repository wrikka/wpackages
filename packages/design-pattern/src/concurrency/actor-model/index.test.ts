import { describe, it, expect, spyOn, sleep } from 'bun:test';
import { ActorSystem, GreeterActor, ResponderActor } from './index';

describe('Actor Model Pattern', () => {
    it('should create actors and dispatch messages', async () => {
        const system = new ActorSystem();
        const greeter = system.createActor(GreeterActor, 'greeter');
        const responder = system.createActor(ResponderActor, 'responder');

        const greeterSpy = spyOn(greeter, 'onReceive');
        const responderSpy = spyOn(responder, 'onReceive');

        system.dispatch('greeter', { type: 'GREET', payload: { name: 'World' } });
        system.dispatch('greeter', { type: 'RESPOND', payload: { replyTo: 'responder' } });

        // Wait for async message dispatch
        await sleep(10);

        expect(greeterSpy).toHaveBeenCalledWith({ type: 'GREET', payload: { name: 'World' } });
        expect(greeterSpy).toHaveBeenCalledWith({ type: 'RESPOND', payload: { replyTo: 'responder' } });
        expect(responderSpy).toHaveBeenCalledWith({ type: 'GREETING_RESPONSE' });
    });
});
