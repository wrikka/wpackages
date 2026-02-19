import { describe, it, expect, spyOn } from 'bun:test';
import { Invoker, SimpleCommand, ComplexCommand, Receiver } from './index';

describe('Command Pattern', () => {
    it('should execute commands through an invoker', () => {
        const invoker = new Invoker();
        const simpleCommand = new SimpleCommand('Say Hi!');
        const receiver = new Receiver();
        const complexCommand = new ComplexCommand(receiver, 'Send email', 'Save report');

        const simpleCommandSpy = spyOn(simpleCommand, 'execute');
        const complexCommandSpy = spyOn(complexCommand, 'execute');

        invoker.setOnStart(simpleCommand);
        invoker.setOnFinish(complexCommand);

        invoker.doSomethingImportant();

        expect(simpleCommandSpy).toHaveBeenCalled();
        expect(complexCommandSpy).toHaveBeenCalled();
    });
});
