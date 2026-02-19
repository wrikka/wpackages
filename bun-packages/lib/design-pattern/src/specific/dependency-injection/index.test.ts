import { describe, it, expect, spyOn } from 'bun:test';
import { DIContainer, ILogger, ConsoleLogger, UserService } from './index';

describe('Dependency Injection Pattern', () => {
    it('should inject dependencies into a class', () => {
        const container = new DIContainer();

        // Register the concrete implementation of the logger
        const logger = new ConsoleLogger();
        container.register('ILogger', logger);

        // Manually resolve the dependency and create the UserService
        const resolvedLogger = container.resolve<ILogger>('ILogger');
        const userService = new UserService(resolvedLogger);

        const logSpy = spyOn(logger, 'log');

        userService.createUser('Alice');

        expect(logSpy).toHaveBeenCalledWith('Creating user: Alice');
    });

    it('should allow for easy mocking of dependencies', () => {
        const container = new DIContainer();

        // Register a mock logger for testing
        const mockLogger: ILogger = {
            log: () => {},
        };
        const logSpy = spyOn(mockLogger, 'log');
        container.register('ILogger', mockLogger);

        const resolvedLogger = container.resolve<ILogger>('ILogger');
        const userService = new UserService(resolvedLogger);

        userService.createUser('Bob');

        expect(logSpy).toHaveBeenCalledWith('Creating user: Bob');
    });
});
