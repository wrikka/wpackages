export { DevServer } from './lib/devserver';
export { HmrService } from './services/hmr.service';
export { FileWatcherService } from './services/file-watcher.service';
export { FileUtils } from './utils/file.util';
export { ConsoleLogger, NoOpLogger } from './utils/logger.util';
export { createDefaultConfig } from './config/default.config';

export * from './types';
export * from './constants';

import { DevServer } from './lib/devserver';
import { createDefaultConfig } from './config/default.config';
import type { DevServerConfig, Plugin } from './types';

export function createDevServer(config?: Partial<DevServerConfig>, plugins?: Plugin[]): DevServer {
  const finalConfig = createDefaultConfig(config);
  return new DevServer(finalConfig, plugins);
}

export default createDevServer;
