import { Container } from '@wts/dependencies';
import { UserService } from '../features/users/user.service';
import { configProvider } from './config';

const container = new Container();

// Register configuration provider as a value
container.register('config', { useValue: configProvider });

// Register UserService with a factory function that resolves its dependencies
container.register('userService', {
    useFactory: (c) => new UserService(c.get('config')),
    deps: ['config'],
});

export { container };
