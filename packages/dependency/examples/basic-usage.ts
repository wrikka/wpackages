import 'reflect-metadata';
import { injectable, register, resolve, Scope } from '../src';

// 1. Define your services

@injectable()
class Logger {
  log(message: string) {
    console.log(`[LOG]: ${message}`);
  }
}

@injectable()
class AppService {
  constructor(private logger: Logger) {}

  run() {
    this.logger.log('Application is running!');
  }
}

// 2. Register your services

// Register Logger as a singleton. The same instance will be used everywhere.
register(Logger, Scope.Singleton);

// Register AppService as a transient. A new instance will be created each time.
register(AppService, Scope.Transient);

// 3. Resolve the main service and run the application
const app = resolve(AppService);
app.run();

// 4. Verify singleton scope
const logger1 = resolve(Logger);
const logger2 = resolve(Logger);

console.log(`Are loggers the same instance? ${logger1 === logger2}`); // true
