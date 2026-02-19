#!/usr/bin/env bun

import { createDevServer } from '../index';
import { ConsoleLogger } from '../utils/logger.util';
import type { DevServerConfig } from '../types';

interface CliOptions {
  port?: number;
  host?: string;
  root?: string;
  base?: string;
  hmr?: boolean;
  cors?: boolean;
  open?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: CliOptions = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--port':
      case '-p':
        options.port = parseInt(args[++i]);
        break;
      case '--host':
      case '-h':
        options.host = args[++i];
        break;
      case '--root':
      case '-r':
        options.root = args[++i];
        break;
      case '--base':
      case '-b':
        options.base = args[++i];
        break;
      case '--no-hmr':
        options.hmr = false;
        break;
      case '--no-cors':
        options.cors = false;
        break;
      case '--open':
      case '-o':
        options.open = true;
        break;
      case '--log-level':
        options.logLevel = args[++i] as any;
        break;
      case '--help':
      case '-H':
        showHelp();
        process.exit(0);
        break;
    }
  }

  return options;
}

function showHelp(): void {
  console.log(`
@wpackages/devserver - Bun-native development server

Usage:
  devserver [options]

Options:
  -p, --port <number>     Port to listen on (default: 5173)
  -h, --host <string>     Host to listen on (default: localhost)
  -r, --root <string>     Root directory (default: current directory)
  -b, --base <string>     Base path (default: /)
  --no-hmr               Disable Hot Module Replacement
  --no-cors              Disable CORS
  -o, --open             Open browser automatically
  --log-level <level>     Log level: debug, info, warn, error (default: info)
  -H, --help             Show this help

Examples:
  devserver --port 3000 --open
  devserver --root ./src --no-hmr
  devserver --host 0.0.0.0 --log-level debug
`);
}

async function main(): Promise<void> {
  const options = parseArgs();
  
  const config: Partial<DevServerConfig> = {
    port: options.port,
    host: options.host,
    root: options.root,
    base: options.base,
    hmr: options.hmr !== undefined ? { enabled: options.hmr } : undefined,
    cors: options.cors !== undefined ? { enabled: options.cors } : undefined,
  };

  const logger = new ConsoleLogger(options.logLevel);
  const server = createDevServer(config);

  try {
    await server.start();

    if (options.open) {
      const url = `http://${server.config.host}:${server.config.port}`;
      console.log(`Opening ${url} in default browser...`);
      
      // Use Bun's built-in open if available, otherwise fallback to platform-specific
      try {
        await Bun.$`open ${url}`;
      } catch {
        if (process.platform === 'darwin') {
          await Bun.$`open ${url}`;
        } else if (process.platform === 'win32') {
          await Bun.$`start ${url}`;
        } else {
          await Bun.$`xdg-open ${url}`;
        }
      }
    }

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down dev server...');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\nShutting down dev server...');
      await server.stop();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start dev server:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
